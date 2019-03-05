from py2neo import Graph
from tendersaucer.utils import chunkify
from tendersaucer.config import APP_CONFIG


_GENRES = []


def artist_exists(artist_id):
    query = 'MATCH (:Artist {id: "%s"}) RETURN 1' % artist_id
    result = _get_graph().run(query)
    return bool(result.data())


def get_related_artist_ids(artist_id, max_num_hops=1):
    query = '''
        MATCH (a:Artist)-[:RELATED*1..%d]-(b:Artist)
        WHERE a.id = "%s" AND a <> b 
        RETURN DISTINCT b.id
    ''' % (max_num_hops, artist_id)
    result = _get_graph().run(query)
    return list(map(lambda artist: artist['b.id'], result))


def get_all_artist_ids():
    query = 'MATCH (a:Artist) return a.id'
    result = _get_graph().run(query)
    for artist in result:
        yield artist['a.id']


def get_genres(artist_id):
    query = '''
        MATCH (a:Artist)-[:IN_GENRE]-(g:Genre)
        WHERE a.id = "%s"
        RETURN DISTINCT g.name
    ''' % artist_id
    result = _get_graph().run(query)
    for genre in result:
        yield genre['g.name']


def get_artists_from_genres(genres, artist_popularity_range=None):
    params = {}
    genres = list(set(genres))
    for index, genre in enumerate(genres):
        params['g%d' % index] = genre
    genre_params = ['$' + param_key for param_key in params.keys()]

    popularity_condition = ''
    if artist_popularity_range:
        popularity_condition = \
            'AND a.popularity >= $min_popularity AND a.popularity <= $max_popularity'
        params['min_popularity'] = artist_popularity_range[0]
        params['max_popularity'] = artist_popularity_range[1]

    query = '''
        MATCH (a:Artist)-[:IN_GENRE]->(g:Genre)
        WHERE g.name IN [{genre_params}] {popularity_condition}
        RETURN DISTINCT a.id;
    '''.format(genre_params=','.join(genre_params), popularity_condition=popularity_condition)
    result = _get_graph().run(query, params)

    return list(map(lambda a: a['a.id'], result))


def get_all_genres(skip_cache=False):
    global _GENRES
    if skip_cache or not _GENRES:
        query = 'MATCH (g:Genre) return g.name'
        result = _get_graph().run(query)
        _GENRES = list(map(lambda genre: genre['g.name'], result))
        return _GENRES
    else:
        return _GENRES


def index_artist(artist, related_artists, genres):
    graph = _get_graph()

    # Create artist-genre relationships
    queries = [
        'MERGE (a:Artist {id: $id0})'
    ]
    parameters = {
        'id0': artist['id']
    }
    for index, genre in enumerate(genres or ()):
        queries.append('MERGE (g%d:Genre {name: $name%d})' % (index, index))
        queries.append('MERGE (a)-[:IN_GENRE]-(g%d)' % index)
        parameters['name%d' % index] = genre
    query = '\n'.join(queries)
    graph.run(query, parameters)

    # Create artist-artist relationships
    queries = [
        'MATCH (a:Artist {id: $id0})',
        'SET a.popularity = %d' % (artist['popularity'] or 0)
    ]
    parameters = {
        'id0': artist['id']
    }
    related_artists = list(filter(
        lambda a: a['popularity'] and a['genres'], related_artists))
    related_artist_batches = chunkify(related_artists, 10)
    for related_artists in related_artist_batches:
        related_artist_queries = []
        for index, related_artist in enumerate(related_artists):
            related_artist_query = '''
                MERGE (b{index}:Artist {{id: $id{index}}})
                ON CREATE SET b{index}.popularity = {popularity}
                MERGE (a)-[:RELATED]-(b{index})
            '''.format(index=index + 1, popularity=related_artist['popularity'] or 0)
            related_artist_queries.append(related_artist_query)
            parameters['id%d' % (index + 1)] = related_artist['id']
        query = '\n'.join(queries + related_artist_queries)
        graph.run(query, parameters)


def _get_graph():
    return Graph(**APP_CONFIG['neo4j'])
