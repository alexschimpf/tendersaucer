from py2neo import Graph
from tendersaucer.config import APP_CONFIG


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


def get_genres(artist_id):
    query = 'MATCH (a:Artist)-[:IN_GENRE]-(g:Genre) ' \
            'WHERE a.id = "%s"' \
            'RETURN DISTINCT g.name' % artist_id
    result = _get_graph().run(query)
    return list(map(lambda artist: artist['g.name'], result))


def index_artist(artist_id, related_artist_ids, genres):
    # Create artist-genre relationships
    queries = [
        'MERGE (a:Artist {id: $id0})'
    ]
    parameters = {
        'id0': artist_id
    }
    for index, genre in enumerate(genres):
        queries.append('MERGE (g%d:Genre {name: $name%d})' % (index, index))
        queries.append('MERGE (a)-[:IN_GENRE]-(g%d)' % index)
        parameters['name%d' % index] = genre
    query = '\n'.join(queries)
    _get_graph().run(query, parameters)

    # Create artist-artist relationships
    queries = [
        'MATCH (a:Artist {id: $id0})'
    ]
    parameters = {
        'id0': artist_id
    }
    for index, related_artist_id in enumerate(related_artist_ids):
        queries.append('MERGE (b%d:Artist {id: $id%d})' % (index + 1, index + 1))
        queries.append('MERGE (a)-[:RELATED]-(b%d)' % (index + 1))
        parameters['id%d' % (index + 1)] = related_artist_id
    query = '\n'.join(queries)
    _get_graph().run(query, parameters)


def _get_graph():
    return Graph(**APP_CONFIG['neo4j'])
