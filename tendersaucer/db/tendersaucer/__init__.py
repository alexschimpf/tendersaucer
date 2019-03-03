from tendersaucer.config import APP_CONFIG
from mysql.connector.pooling import MySQLConnectionPool

CONNECTION_POOL = MySQLConnectionPool(
    pool_name="tendersaucer",
    **APP_CONFIG['mysql']
)
