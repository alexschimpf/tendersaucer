import random
from celery import Celery
from celery import states
from tendersaucer import utils
from celery.exceptions import Ignore
from tendersaucer.config import APP_CONFIG
from tendersaucer.service import neo4j_client
from tendersaucer.db.tendersaucer import top_tracks
from tendersaucer.service.spotify_client import Spotify
from concurrent.futures import ThreadPoolExecutor, as_completed


MAX_NUM_TRACKS = 50
NUM_THREAD_WORKERS = 4
MAX_NUM_SEED_ARTISTS_BY_SEARCH_DEPTH = {
    0: None,
    1: None,
    2: 100,
    3: 50
}

app = Celery('tendersaucer.tasks', **APP_CONFIG['celery'])


@app.task(bind=True)
def build_personalized_playlist(
        self, spotify_access_token, playlist_name, time_ranges, artist_popularity_range,
        track_release_year_range, track_danceability_range, track_tempo_range, included_genres,
        excluded_genres, exclude_familiar_artists, max_search_depth):
    included_genres = set(included_genres or ())
    excluded_genres = set(excluded_genres or ())

    spotify_client = Spotify(auth=spotify_access_token)

    user_top_artists = spotify_client.get_user_top_artists(time_ranges=time_ranges)
    max_num_seed_artists = MAX_NUM_SEED_ARTISTS_BY_SEARCH_DEPTH[max_search_depth]
    if max_num_seed_artists:
        user_top_artists = random.sample(user_top_artists, min(len(user_top_artists), max_num_seed_artists))

    seed_artists = list(user_top_artists)
    if max_search_depth:
        # Get related artists of user's favorite artists
        with ThreadPoolExecutor(max_workers=NUM_THREAD_WORKERS) as executor:
            futures = []
            for user_top_artist in user_top_artists:
                future = executor.submit(
                    neo4j_client.get_related_artists,
                    artist_id=user_top_artist['id'], max_num_hops=max_search_depth)
                futures.append(future)
            for future in as_completed(futures):
                seed_artists.extend(future.result() or ())

    excluded_artists = set()
    if exclude_familiar_artists:
        excluded_artists = _get_familiar_artists(spotify_client=spotify_client)

    # Filter out artists that don't meet criteria
    seed_artist_ids = set()
    for seed_artist in seed_artists:
        artist_popularity = seed_artist['popularity'] or 0
        if artist_popularity_range[0] <= artist_popularity <= artist_popularity_range[1] and \
                seed_artist['id'] not in excluded_artists:
            seed_artist_ids.add(seed_artist['id'])
    seed_artist_ids = random.sample(seed_artist_ids, min(len(seed_artist_ids), 1000))

    # Filter artists by genre
    if included_genres or excluded_genres:
        seed_artist_chunks = utils.chunkify(seed_artist_ids, 1000)

        seed_artist_ids = set()
        for seed_artist_chunk in seed_artist_chunks:
            artist_genres = neo4j_client.get_artist_genres(artist_ids=seed_artist_chunk)
            for item in artist_genres:
                genres = set(item['genres'])
                if not genres.intersection(excluded_genres) and \
                        (not included_genres or genres.intersection(included_genres)):
                    seed_artist_ids.add(item['id'])

    if not seed_artist_ids:
        _set_failure_state(
            task=self, exception=utils.TendersaucerException(
                'Your criteria is too limiting. Please loosen your criteria and try again.'))
        raise Ignore()

    # Get filtered artists' tracks that meet criteria
    track_ids = top_tracks.get_tracks(
        artist_ids=seed_artist_ids, tempo_range=track_tempo_range,
        release_year_range=track_release_year_range, danceability_range=track_danceability_range)
    track_ids = random.sample(track_ids, min(len(track_ids), MAX_NUM_TRACKS))

    try:
        spotify_client.export_playlist(playlist_name=playlist_name, track_ids=track_ids)
    except utils.TendersaucerException as e:
        _set_failure_state(task=self, exception=e)
        raise Ignore()

    message = 'Your playlist has been created.'
    if len(track_ids) < MAX_NUM_TRACKS:
        message += ' However, your criteria may be too limiting. ' \
                   'Try loosening your criteria for better results.'
    self.update_state(
        state=states.SUCCESS,
        meta={
            'message': message
        }
    )
    raise Ignore()


@app.task(bind=True)
def build_genre_playlist(
        self, spotify_access_token, playlist_name, genres, artist_popularity_range, track_release_year_range,
        track_danceability_range, track_tempo_range, exclude_familiar_artists):
    spotify_client = Spotify(auth=spotify_access_token)

    seed_artists = neo4j_client.get_artists_from_genres(genres=genres)

    excluded_artists = set()
    if exclude_familiar_artists:
        excluded_artists = _get_familiar_artists(spotify_client=spotify_client)

    # Filter out artists that don't meet criteria
    seed_artist_ids = set()
    for seed_artist in seed_artists:
        artist_popularity = seed_artist['popularity'] or 0
        if artist_popularity_range[0] <= artist_popularity <= artist_popularity_range[1] and \
                seed_artist['id'] not in excluded_artists:
            seed_artist_ids.add(seed_artist['id'])

    seed_artist_ids = random.sample(seed_artist_ids, min(len(seed_artist_ids), 1000))
    if not seed_artist_ids:
        _set_failure_state(
            task=self, exception=utils.TendersaucerException(
                'Your criteria is too limiting. Please loosen your criteria and try again.'))
        raise Ignore()

    # Fetch filtered artists' tracks that meet criteria
    track_ids = top_tracks.get_tracks(
        artist_ids=seed_artist_ids, tempo_range=track_tempo_range,
        release_year_range=track_release_year_range, danceability_range=track_danceability_range)
    track_ids = random.sample(track_ids, min(len(track_ids), MAX_NUM_TRACKS))

    try:
        spotify_client.export_playlist(playlist_name=playlist_name, track_ids=track_ids)
    except utils.TendersaucerException as e:
        _set_failure_state(task=self, exception=e)
        raise Ignore()

    message = 'Your playlist has been created.'
    if len(track_ids) < MAX_NUM_TRACKS:
        message += ' However, your criteria may be too limiting. ' \
                   'Try loosening your criteria for better results.'
    self.update_state(
        state=states.SUCCESS,
        meta={
            'message': message
        }
    )
    raise Ignore()


def _get_familiar_artists(spotify_client):
    artist_ids = set()
    artist_ids.add(spotify_client.get_artists_from_user_saved_tracks() or ())
    artist_ids.add(spotify_client.get_artists_from_user_playlists() or ())
    for artist in spotify_client.get_user_top_artists(
            time_ranges=('short_term', 'medium_term', 'long_term')) or ():
        artist_ids.add(artist['id'])

    return artist_ids


def _set_failure_state(task, exception):
    if isinstance(exception, utils.TendersaucerException):
        task.update_state(
            state=states.FAILURE,
            meta={
                'exc_type': 'EXPECTED',
                'exc_message': str(exception)
            }
        )
    else:
        task.update_state(
            state=states.FAILURE,
            meta={
                'exc_type': 'UNEXPECTED',
                'exc_message': 'Sorry, something went wrong. Please try again.'
            }
        )
