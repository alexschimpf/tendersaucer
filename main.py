import os
import json
import time
import redis
import datetime
from celery.result import AsyncResult
from flask_session import Session
from flask import Flask, request, session, redirect, jsonify, render_template
from tendersaucer.config import APP_CONFIG
from tendersaucer.service.spotify_client import Spotify
from tendersaucer.service import redis_client, neo4j_client
from tendersaucer.tasks import app as celery_app, build_genre_playlist, build_artist_playlist
from tendersaucer.utils import catch_errors, spotfiy_auth_required, delimited_list, boolean, TendersaucerException


DEFAULT_NUM_SEARCH_RESULTS = 100

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
    is_logged_in = 'true' if session.get('spotify_access_token') else 'false'
    return render_template('_index.html', is_logged_in=is_logged_in)


@app.route('/search/genres', methods=['GET'])
@catch_errors
def search_genres():
    query = (request.args.get('query') or '').strip().lower()

    results = []
    if query:
        genres = neo4j_client.get_all_genres()
        matching_genres = list(filter(lambda genre: query in genre.lower(), genres))

        exact_matches = []
        prefix_matches = []
        substring_matches = []
        for genre in matching_genres:
            if genre == query:
                exact_matches.append(genre)
            elif genre.startswith(query):
                prefix_matches.append(genre)
            elif query in genre:
                substring_matches.append(genre)

        results = exact_matches + prefix_matches + substring_matches
        results = results[:DEFAULT_NUM_SEARCH_RESULTS]

    return jsonify(genres=results)


@app.route('/search/artists', methods=['GET'])
@catch_errors
def search_artists():
    query = (request.args.get('query') or '').strip().lower()

    spotify_access_token = session['spotify_access_token']
    spotify_client = Spotify(auth=spotify_access_token)

    results = []
    artists = spotify_client.search(q=query, limit=50, type='artist')
    for artist in (artists or {}).get('artists', {}).get('items') or ():
        results.append({'id': artist['id'], 'name': artist['name']})

    names_found = set()
    exact_matches = []
    prefix_matches = []
    substring_matches = []
    other_matches = []
    for result in results:
        artist_name = result['name'].lower()

        if artist_name in names_found:
            continue

        names_found.add(artist_name)

        if artist_name == query:
            exact_matches.append(result)
        elif artist_name.startswith(query):
            prefix_matches.append(result)
        elif query in artist_name:
            substring_matches.append(result)
        else:
            other_matches.append(result)
    results = exact_matches + prefix_matches + substring_matches + other_matches

    return jsonify(artists=results)


@app.route('/build_playlist', methods=['GET'])
@spotfiy_auth_required
@catch_errors
def build_playlist():
    spotify_access_token = session['spotify_access_token']

    playlist_name = request.args.get('playlist_name')
    artist_popularity_range = request.args.get('artist_popularity_range', type=delimited_list(int))
    track_release_year_range = request.args.get('track_release_year_range', type=delimited_list(int))
    track_danceability_range = request.args.get('track_danceability_range', type=delimited_list(int))
    track_tempo_range = request.args.get('track_tempo_range', type=delimited_list(int))
    included_genres = request.args.get('included_genres', type=delimited_list())
    excluded_genres = request.args.get('excluded_genres', type=delimited_list())
    included_artists = request.args.get('included_artists', type=delimited_list())
    exclude_familiar_artists = request.args.get('exclude_familiar_artists', type=boolean, default=False)

    max_search_depth = request.args.get('max_search_depth', type=int)
    if max_search_depth > 3:
        raise TendersaucerException('max_search_depth must be <= 3')
    if max_search_depth == 0 and exclude_familiar_artists:
        raise TendersaucerException('You cannot both exclude familiar artists and have max_search_depth = 0')

    playlist_type = request.args.get('playlist_type')
    if playlist_type == 'genre':
        result = build_genre_playlist.delay(
            spotify_access_token, playlist_name, included_genres, artist_popularity_range,
            track_release_year_range, track_danceability_range, track_tempo_range, exclude_familiar_artists)
    elif playlist_type == 'artist':
        result = build_artist_playlist.delay(
            spotify_access_token, playlist_name, artist_popularity_range, track_release_year_range,
            track_danceability_range, track_tempo_range, included_genres, included_artists, excluded_genres,
            exclude_familiar_artists, max_search_depth)
    else:
        raise TendersaucerException('Invalid playlist_type')

    return jsonify(task_id=result.task_id)


@app.route('/task/<task_id>/status', methods=['GET'])
@catch_errors
def get_task_status(task_id):
    message = None
    progress = 0.0
    result = AsyncResult(id=task_id, app=celery_app)
    if result.state in ('SUCCESS', 'FAILURE'):
        progress = 100.0
        result_meta = result.backend.get(result.backend.get_key_for_task(result.id))
        result_meta = json.loads(result_meta.decode('utf8'))
        if result.state == 'SUCCESS':
            message = result_meta['result']['message']
        else:
            if result_meta['result']['exc_type'] == 'EXPECTED':
                message = result_meta['result']['exc_message']
            else:
                message = 'There was a problem generating your playlist. Please try again.'

    return jsonify(progress=progress, state=result.state, message=message)


@app.route('/user_top_genres', methods=['GET'])
@spotfiy_auth_required
@catch_errors
def get_user_top_genres():
    spotify_access_token = session['spotify_access_token']
    spotify_client = Spotify(auth=spotify_access_token)
    user_top_genres = spotify_client.get_user_top_genres(limit=30)

    return jsonify(top_genres=user_top_genres)


@app.route('/user_top_artists', methods=['GET'])
@spotfiy_auth_required
@catch_errors
def get_user_top_artists():
    time_range = request.args.get('time_range')
    if time_range not in ('short', 'medium', 'long'):
        raise TendersaucerException('time_range must be one of: short, medium, long')
    time_range += '_term'

    spotify_access_token = session['spotify_access_token']
    spotify_client = Spotify(auth=spotify_access_token)
    user_top_artists = spotify_client.get_user_top_artists(time_ranges=(time_range,), limit=50)
    user_top_artists = [dict(id=artist['id'], name=artist['name']) for artist in user_top_artists]

    return jsonify(top_artists=user_top_artists)


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
