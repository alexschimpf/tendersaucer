import os
import time
import tasks
import redis
import json
import datetime
from flask_session import Session
from tasks import app as celery_app
from celery.result import AsyncResult
from app_config import APP_CONFIG, GENRES
from service import redis_service as Redis
from service.spotify_service import Spotify
from flask import Flask, request, render_template, session, redirect, jsonify
from utils import catch_errors, delimited_list, boolean, CustomException, spotfiy_auth_required


app = Flask(__name__, template_folder='static')
app.secret_key = os.urandom(24)
app.config.update({
    'SESSION_TYPE': 'redis',
    'SESSION_KEY_PREFIX': 'session:',
    'PERMANENT_SESSION_LIFETIME': datetime.timedelta(hours=24),
    'SESSION_REDIS': redis.Redis(connection_pool=Redis.SESSION_CONN_POOL),
    'SECRET_KEY': APP_CONFIG.get('session_secret_key') or os.getenv('SESSION_SECRET_KEY')
})
Session(app)


@app.route('/logout', methods=['GET'])
@catch_errors
def logout():
    session.clear()
    return redirect('/')


@app.route('/get_spotify_auth', methods=['GET'])
@catch_errors
def spotify_authentication():
    curr_time = time.time()
    oauth_client = Spotify.get_oauth_client()
    if not session.get('spotify_access_token'):
        return redirect(oauth_client.get_authorize_url())
    elif session.get('spotify_access_token_expiry_time') <= curr_time:
        refresh_token = session.get('spotify_refresh_token')
        token_info = oauth_client.refresh_access_token(refresh_token=refresh_token)
        session['spotify_access_token'] = token_info['access_token']
        session['spotify_access_token_expiry_time'] = token_info['expires_at']
        if 'refresh_token' in token_info:
            session['spotify_refresh_token'] = token_info['refresh_token']

    return redirect('/')


@app.route('/spotify_callback', methods=['GET'])
@catch_errors
def spotify_callback():
    auth_client = Spotify.get_oauth_client()
    spotify_access_code = auth_client.parse_response_code(request.url)
    token_info = auth_client.get_access_token(spotify_access_code)
    session['spotify_access_token'] = token_info['access_token']
    session['spotify_refresh_token'] = token_info['refresh_token']
    session['spotify_access_token_expiry_time'] = token_info['expires_at']

    return redirect('/')


if APP_CONFIG['environment'] == 'dev':
    @app.route('/me', methods=['GET'])
    @catch_errors
    def me():
        return jsonify(dict(session))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)