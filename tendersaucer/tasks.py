from celery import Celery
from tendersaucer.config import APP_CONFIG


app = Celery('tasks', backend=APP_CONFIG['celery']['backend'], broker=APP_CONFIG['celery']['broker'])
