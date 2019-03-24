import os
import json
import time
import redis
import datetime
from flask_session import Session
from celery.result import AsyncResult
from tendersaucer.config import APP_CONFIG
from tendersaucer.service.spotify_client import Spotify
from tendersaucer.service import redis_client, neo4j_client
from flask import Flask, request, session, redirect, jsonify, render_template
from tendersaucer.tasks import app as celery_app, build_genre_playlist, build_personalized_playlist
from tendersaucer.utils import catch_errors, spotfiy_auth_required, delimited_list, TendersaucerException


app = Flask(__name__, template_folder='static')
app.secret_key = os.urandom(24)
app.config.update({
    'SESSION_TYPE': 'redis',
    'SESSION_KEY_PREFIX': 'session:',
    'PERMANENT_SESSION_LIFETIME': datetime.timedelta(hours=24),
    'SESSION_REDIS': redis.Redis(connection_pool=redis_client.SESSION_CONN_POOL),
    'SECRET_KEY': APP_CONFIG.get('session_secret_key') or os.getenv('SESSION_SECRET_KEY')
})
Session(app)


@app.route('/', methods=['GET'])
@catch_errors
def index():
    genres = neo4j_client.get_all_genres()
    is_logged_in = 'true' if session.get('spotify_access_token') else 'false'
    return render_template('_index.html', genres=json.dumps(genres), is_logged_in=is_logged_in)


@app.route('/build_playlist', methods=['GET'])
@spotfiy_auth_required
@catch_errors
def build_playlist():
    spotify_access_token = session['spotify_access_token']

    playlist_name = request.args.get('playlist_name')
    time_ranges = request.arg.get('time_ranges', delimited_list)
    artist_popularity_range = request.args.get('artist_popularity_range', delimited_list)
    track_release_year_range = request.args.get('track_release_year_range', delimited_list)
    track_danceability_range = request.args.get('track_danceability_range', delimited_list)
    track_tempo_range = request.args.get('track_tempo_range', delimited_list)
    included_genres = request.args.get('included_genres', delimited_list)
    excluded_genres = request.args.get('excluded_genres', delimited_list)
    exclude_familiar_artists = request.args.get('exclude_familiar_artists', bool)

    max_search_depth = request.args.get('max_search_depth', int)
    if max_search_depth > 3:
        raise TendersaucerException('max_search_depth must be <= 3')
    if max_search_depth == 0 and exclude_familiar_artists:
        raise TendersaucerException('You cannot both exclude familiar artists and have max_search_depth = 0')

    playlist_type = request.args.get('playlist_type')
    if playlist_type == 'genre':
        task = build_genre_playlist
        result = task.delay(
            spotify_access_token, playlist_name, time_ranges, artist_popularity_range,
            track_release_year_range, track_danceability_range, track_tempo_range, included_genres,
            excluded_genres, exclude_familiar_artists, max_search_depth)
    elif playlist_type == 'personalized':
        task = build_personalized_playlist
        result = task.delay(
            spotify_access_token, playlist_name, included_genres, artist_popularity_range,
            track_release_year_range, track_danceability_range, track_tempo_range, exclude_familiar_artists)
    else:
        raise TendersaucerException('Invalid playlist_type')

    return jsonify(task_id=result.task_id)


@app.route('/task/<task_id>/status', methods=['GET'])
@catch_errors
def get_task_status(task_id):
    progress = 0.0
    result = AsyncResult(id=task_id, app=celery_app)
    if result.state == 'IN_PROGRESS':
        progress = result.result['value']
    elif result.state in ('FAILURE', 'SUCCESS'):
        progress = 100.0

    return jsonify(progress=progress)


@app.route('/get_spotify_auth', methods=['GET'])
@catch_errors
def get_spotify_auth():
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


@app.route('/logout', methods=['GET'])
@catch_errors
def logout():
    session.clear()
    return redirect('/')


if APP_CONFIG['environment'] == 'dev':
    @app.route('/me', methods=['GET'])
    @catch_errors
    def me():
        return jsonify(dict(session))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)