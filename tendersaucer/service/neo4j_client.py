from py2neo import Graph
from tendersaucer.config import APP_CONFIG


GRAPH = Graph(**APP_CONFIG['neo4j'])


def artist_exists(artist_id):
    query = 'MATCH (:Artist {id: "%s"}) RETURN 1' % artist_id
    result = GRAPH.run(query)
    return bool(result.data())


def get_related_artist_ids(artist_id, max_num_hops=1):
    query = 'MATCH (a:Artist)-[:RELATED*1..%d]-(b:Artist) ' \
            'WHERE a.id = "%s" AND a <> b ' \
            'RETURN DISTINCT b.id' % (max_num_hops, artist_id)
    result = GRAPH.run(query)
    return list(map(lambda artist: artist['b.id'], result))


def get_genres(artist_id):
    query = 'MATCH (a:Artist)-[:IN_GENRE]-(g:Genre) ' \
            'WHERE a.id = "%s"' \
            'RETURN DISTINCT g.name' % artist_id
    result = GRAPH.run(query)
    return list(map(lambda artist: artist['g.name'], result))


def index_artist(artist_id, related_artist_ids, genres):
    queries = [
        'MERGE (a0:Artist {id: "%s"})' % artist_id,
    ]
    for index, genre in enumerate(genres):
        queries.append('MERGE (g%d:Genre {name: "%s"})' % (index, genre))
        queries.append('MERGE (a0)-[:IN_GENRE]->(g%d)' % index)
    for index, related_artist_id in enumerate(related_artist_ids):
        queries.append('MERGE (a%d:Artist {id: "%s"})' % (index + 1, related_artist_id))
        queries.append('MERGE (a0)-[:RELATED]->(a%d)' % (index + 1))
        queries.append('MERGE (a%d)-[:RELATED]->(a0)' % (index + 1))
    query = '\n'.join(queries)
    GRAPH.run(query)
