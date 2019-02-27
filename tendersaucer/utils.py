import time
import logging
import functools
import threading
import logging.config
from flask import Response, session, redirect
from tendersaucer.config import APP_CONFIG


logger = logging.getLogger('utils')


class ConcurrentSet(set):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.lock = threading.RLock()

    def add(self, *args, **kwargs):
        self.lock.acquire()
        super().add(*args, **kwargs)
        self.lock.release()

    def __contains__(self, *args, **kwargs):
        self.lock.acquire()
        super().__contains__(*args, **kwargs)
        self.lock.release()


class CustomException(Exception):
    pass


def catch_errors(func):
    @functools.wraps(func)
    def wrapped(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
        except Exception as e:
            logger.exception(e)
            if isinstance(e, CustomException):
                return Response(str(e), 400)
            else:
                return Response('Unexpected error', 500)
        return result
    return wrapped


def spotfiy_auth_required(func):
    from tendersaucer.service import spotify_client

    @functools.wraps(func)
    def wrapped(*args, **kwargs):
        curr_time = time.time()
        if not session.get('spotify_access_token'):
            return redirect('/')
        elif session.get('spotify_access_token_expiry_time') <= curr_time:
            refresh_token = session.get('spotify_refresh_token')
            oauth_client = spotify_client.get_oauth_client()
            token_info = oauth_client.refresh_access_token(refresh_token=refresh_token)
            session['spotify_access_token'] = token_info['access_token']
            session['spotify_access_token_expiry_time'] = token_info['expires_at']
            if 'refresh_token' in token_info:
                session['spotify_refresh_token'] = token_info['refresh_token']

        return func(*args, **kwargs)

    return wrapped


def delimited_list(text):
    if not text:
        return None
    return text.split(',')


def boolean(text):
    return str(text).lower() in ('1', 'true', 'yes', 'y')


def init_logger():
    logging.config.dictConfig(APP_CONFIG['logging'])
