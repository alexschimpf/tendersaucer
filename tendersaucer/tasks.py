from celery import Celery
from tendersaucer.config import APP_CONFIG


app = Celery('tasks', **APP_CONFIG['celery'])


