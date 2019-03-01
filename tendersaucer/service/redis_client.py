import redis
from tendersaucer.config import APP_CONFIG


SESSION_CONN_POOL = redis.BlockingConnectionPool(**APP_CONFIG['redis']['session'])
