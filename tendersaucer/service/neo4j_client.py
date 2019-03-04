from py2neo import Graph
from tendersaucer.config import APP_CONFIG


_GENRES = []


def artist_exists(artist_id):
    query = 'MATCH (:Artist {id: "%s"}) RETURN 1' % artist_id
    result = _get_graph().run(query)
    return bool(result.data())


def get_related_artist_ids(artist_id, max_num_hops=1):
    query = 'MATCH (a:Artist)-[:RELATED*1..%d]-(b:Artist) ' \
            'WHERE a.id = "%s" AND a <> b ' \
            'RETURN DISTINCT b.id' % (max_num_hops, artist_id)
    result = _get_graph().run(query)
    return list(map(lambda artist: artist['b.id'], result))


def get_all_artist_ids():
    query = "MATCH (a:Artist) return a.id"
    result = _get_graph().run(query)
    for artist in result:
        yield artist['a.id']


def get_genres(artist_id):
    query = 'MATCH (a:Artist)-[:IN_GENRE]-(g:Genre) ' \
            'WHERE a.id = "%s"' \
            'RETURN DISTINCT g.name' % artist_id
    result = _get_graph().run(query)
    for genre in result:
        yield genre['g.name']


def get_all_genres(skip_cache=False):
    global _GENRES
    if skip_cache or not _GENRES:
        query = "MATCH (g:Genre) return g.name"
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
    related_artists = list(related_artists)
    if len(related_artists) < 15:
        related_artist_batches = [related_artists]
    else:
        # Split up artists into 2 batches to make 2 smaller queries
        split_index = int(len(related_artists) / 2)
        related_artist_batches = [
            related_artists[:split_index],
            related_artists[split_index:]
        ]

    for related_artists in related_artist_batches:
        related_artist_queries = []
        for index, related_artist in enumerate(related_artists):
            related_artist_queries.append('MERGE (b%d:Artist {id: $id%d})' % (index + 1, index + 1))
            related_artist_queries.append(
                'ON CREATE SET b%d.popularity = %d' % (index + 1, related_artist['popularity'] or 0))
            related_artist_queries.append('MERGE (a)-[:RELATED]-(b%d)' % (index + 1))
            parameters['id%d' % (index + 1)] = related_artist['id']
        query = '\n'.join(queries + related_artist_queries)
        graph.run(query, parameters)


def _get_graph():
    return Graph(**APP_CONFIG['neo4j'])
