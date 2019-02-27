import redis
from tendersaucer.config import APP_CONFIG


SPOTIFY_CONN_POOL = redis.BlockingConnectionPool(**APP_CONFIG['redis']['spotify'])
SESSION_CONN_POOL = redis.BlockingConnectionPool(**APP_CONFIG['redis']['session'])


def _get_spotify_redis_conn(conn_type):
    return redis.StrictRedis(connection_pool=SPOTIFY_CONN_POOL)
