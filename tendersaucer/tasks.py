import random
from celery import Celery
from tendersaucer import utils
from tendersaucer.config import APP_CONFIG
from tendersaucer.service import neo4j_client
from tendersaucer.db.tendersaucer import top_tracks
from tendersaucer.service.spotify_client import Spotify


app = Celery('tasks', **APP_CONFIG['celery'])


@app.task(bind=True)
def build_personalized_playlist(
        self, spotify_access_token, playlist_name, time_ranges, artist_popularity_range,
        track_release_year_range, track_danceability_range, track_tempo_range, included_genres,
        excluded_genres, exclude_familiar_artists, max_search_depth):
    included_genres = set(included_genres or ())
    excluded_genres = set(excluded_genres or ())

    spotify_client = Spotify(auth=spotify_access_token)

    # Get related artists of user's favorite artists
    seed_artists = spotify_client.get_user_top_artists(time_ranges=time_ranges)
    for seed_artist in seed_artists:
        related_artists = neo4j_client.get_related_artists(
            artist_id=seed_artist['id'], max_num_hops=max_search_depth)
        seed_artists.extend(related_artists)

    excluded_artists = set()
    if exclude_familiar_artists:
        excluded_artists = _get_familiar_artists(spotify_client=spotify_client)

    # Filter out artists that don't meet criteria
    seed_artist_ids = set()
    for seed_artist in seed_artists:
        if artist_popularity_range[0] <= seed_artist['popularity'] <= artist_popularity_range[1] and \
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

    # Get filtered artists' tracks that meet criteria
    track_ids = top_tracks.get_tracks(
        artist_ids=seed_artist_ids, tempo_range=track_tempo_range,
        release_year_range=track_release_year_range, danceability_range=track_danceability_range)
    track_ids = random.sample(track_ids, min(len(track_ids), 50))

    spotify_client.export_playlist(playlist_name=playlist_name, track_ids=track_ids)


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
        if artist_popularity_range[0] <= seed_artist['popularity'] <= artist_popularity_range[1] and \
                seed_artist['id'] not in excluded_artists:
            seed_artist_ids.add(seed_artist['id'])

    seed_artist_ids = random.sample(seed_artist_ids, min(len(seed_artist_ids), 1000))

    # Fetch filtered artists' tracks that meet criteria
    track_ids = top_tracks.get_tracks(
        artist_ids=seed_artist_ids, tempo_range=track_tempo_range,
        release_year_range=track_release_year_range, danceability_range=track_danceability_range)
    track_ids = random.sample(track_ids, min(len(track_ids), 50))

    spotify_client.export_playlist(playlist_name=playlist_name, track_ids=track_ids)


def _get_familiar_artists(spotify_client):
    artist_ids = set()
    artist_ids.add(spotify_client.get_artists_from_user_saved_tracks() or ())
    artist_ids.add(spotify_client.get_artists_from_user_playlists() or ())
    for artist in spotify_client.get_user_top_artists(
            time_ranges=('short_term', 'medium_term', 'long_term')) or ():
        artist_ids.add(artist['id'])

    return artist_ids
