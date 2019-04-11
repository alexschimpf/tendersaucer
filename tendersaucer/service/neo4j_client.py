from py2neo import Graph
from tendersaucer.utils import chunkify
from tendersaucer.config import APP_CONFIG


_GENRES = []


def artist_exists(artist_id):
    query = 'MATCH (:Artist {id: "%s"}) RETURN 1' % artist_id
    result = _get_graph().run(query)
    return bool(result.data())


def get_related_artists(artist_id, max_num_hops=1):
    query = '''
        MATCH (a:Artist)-[:RELATED*1..%d]-(b:Artist)
        WHERE a.id = "%s" AND a <> b 
        RETURN DISTINCT b.id AS id, 
               COLLECT(b.popularity)[0] AS popularity
    ''' % (max_num_hops, artist_id)
    result = _get_graph().run(query)
    return list(map(lambda artist: {
        'id': artist['id'],
        'popularity': artist['popularity']
    }, result))


def get_all_artist_ids():
    query = 'MATCH (a:Artist) return a.id'
    result = _get_graph().run(query)
    for artist in result:
        yield artist['a.id']


def get_artist_genres(artist_ids):
    params = {}
    for index, artist_id in enumerate(artist_ids):
        params['a%d' % index] = artist_id
    artist_id_params = ['$' + param_key for param_key in params.keys()]

    query = '''
        MATCH (a:Artist)-[:IN_GENRE]-(g:Genre)
        WHERE a.id IN {artist_id_params}
        RETURN DISTINCT a.id AS id, 
               COLLECT(g.name) AS genres
    '''.format(artist_id_params=artist_id_params)
    result = _get_graph().run(query, params)
    for genre in result:
        yield genre['g.name']


def get_artists_from_genres(genres):
    params = {}
    genres = list(set(genres))
    for index, genre in enumerate(genres):
        params['g%d' % index] = genre
    genre_params = ['$' + param_key for param_key in params.keys()]

    query = '''
        MATCH (a:Artist)-[:IN_GENRE]->(g:Genre)
        WHERE g.name IN [{genre_params}]
        RETURN DISTINCT a.id AS id, 
               COLLECT(a.popularity)[0] AS popularity;
    '''.format(genre_params=','.join(genre_params))
    result = _get_graph().run(query, params)
    return list(map(lambda artist: {
        'id': artist['id'],
        'popularity': artist['popularity']
    }, result))


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
