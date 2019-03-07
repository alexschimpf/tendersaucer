import time
import string
import random
import logging
import argparse
from lru import LRU
from tendersaucer import utils
from tendersaucer.service import neo4j_client
from tendersaucer.service.spotify_client import Spotify
from concurrent.futures import ThreadPoolExecutor, wait
from tendersaucer.db.tendersaucer import top_tracks as TopTracks


logger = logging.getLogger('scripts.indexer')


def run_discover(visited, artist_cache_size, search_time_limit=None, no_progress_time_limit=None, run_time_limit=None):
    process_start_time = time.time()

    artists_by_id = LRU(artist_cache_size)
    spotify_client = Spotify.get_basic_client()
    while True:
        if run_time_limit and time.time() - process_start_time > run_time_limit:
            logger.info('Run time limit reached. Ending search.')
            break

        try:
            start_time = time.time()
            last_index_time = time.time()

            artist_id = _get_seed_artist()
            stack = [artist_id]
            while stack:
                curr_time = time.time()
                if run_time_limit and curr_time - process_start_time > run_time_limit:
                    break
                if search_time_limit and curr_time - start_time > search_time_limit:
                    logger.info('Search time limit reached. Restarting search.')
                    break
                if no_progress_time_limit and curr_time - last_index_time > no_progress_time_limit:
                    logger.info('No progress is being made. Restarting search.')
                    break

                # Pop up to 50 unvisited artists from the stack
                artist_ids = set()
                pop_start_time = time.time()
                while stack and len(artist_ids) < 50:
                    if time.time() - pop_start_time > 2:
                        break
                    artist_id = stack.pop()
                    if isinstance(artist_id, bytes):
                        artist_id = artist_id.decode('utf8')
                    if artist_id not in visited:
                        visited.add(artist_id)
                        artist_ids.add(artist_id)

                if not artist_ids:
                    continue

                # Split up artists into indexed/non-indexed/cached groups
                indexed_artist_ids = TopTracks.get_artists_with_tracks(artist_ids=artist_ids)

                cached_artist_ids = set()
                non_indexed_artist_ids = set()
                for artist_id in artist_ids:
                    if artist_id not in indexed_artist_ids:
                        if artist_id in artists_by_id:
                            cached_artist_ids.add(artist_id)
                        else:
                            non_indexed_artist_ids.add(artist_id)

                # Fetch new artist ids via Spotify API (and add cached ones)
                non_indexed_artists = spotify_client.get_artists(artist_ids=non_indexed_artist_ids)
                for cached_artist_id in cached_artist_ids:
                    non_indexed_artist = artists_by_id[cached_artist_id]
                    non_indexed_artists.append(non_indexed_artist)

                all_related_artist_ids = set()

                # Get related artists from Neo4j for existing artists
                for indexed_artist_id in indexed_artist_ids:
                    related_artists = neo4j_client.get_related_artists(artist_id=indexed_artist_id)
                    related_artist_ids = [related_artist['id'] for related_artist in related_artists]
                    all_related_artist_ids.update(related_artist_ids)

                for non_indexed_artist in non_indexed_artists:
                    new_artist_id = non_indexed_artist['id']

                    related_artist_ids = set()
                    related_artists = spotify_client.get_related_artists(artist_id=new_artist_id)

                    all_related_artist_ids.update(related_artist_ids)

                    top_tracks = spotify_client.get_top_tracks(artist_id=new_artist_id)
                    if not top_tracks:
                        logger.info('Skipping... no top tracks')
                        continue

                    # Index new artists in redis
                    logger.info(non_indexed_artist['name'])
                    for related_artist in related_artists:
                        related_artist_id = related_artist['id']
                        related_artist_ids.add(related_artist_id)
                        artists_by_id[related_artist_id] = related_artist

                    neo4j_client.index_artist(
                        artist=non_indexed_artist, related_artists=related_artists,
                        genres=non_indexed_artist.get('genres'))

                    # Add top tracks to database
                    top_track_ids = [top_track['id'] for top_track in top_tracks]
                    top_track_audio_features = spotify_client.get_audio_features_for_tracks(track_ids=top_track_ids)
                    TopTracks.insert_or_update_tracks(
                        artist_id=new_artist_id, top_tracks=top_tracks, audio_features=top_track_audio_features)

                    last_index_time = time.time()

                stack.extend(all_related_artist_ids - visited)
        except Exception as e:
            logger.exception(e)


def run_update(visited):
    spotify_client = Spotify.get_basic_client()

    for artist_id in neo4j_client.get_all_artist_ids():
        try:
            if artist_id not in visited:
                visited.add(artist_id)

                artist = spotify_client.get_artist(artist_id=artist_id)
                if artist.get('id') != artist_id:
                    continue

                logger.info('Updating artist: {}'.format(artist['name']))

                related_artists = spotify_client.get_related_artists(artist_id=artist_id)
                neo4j_client.index_artist(
                    artist=artist, related_artists=related_artists, genres=artist.get('genres'))

                # Add top tracks to database
                top_tracks = spotify_client.get_top_tracks(artist_id=artist_id)
                if top_tracks:
                    top_track_ids = [top_track['id'] for top_track in top_tracks]
                    top_track_audio_features = spotify_client.get_audio_features_for_tracks(track_ids=top_track_ids)
                    TopTracks.insert_or_update_tracks(
                        artist_id=artist_id, top_tracks=top_tracks, audio_features=top_track_audio_features)

                # Check for non-indexed related artists
                for artist in related_artists:
                    if not artist['popularity'] or not artist.get('genres'):
                        continue

                    artist_id = artist['id']
                    if not neo4j_client.artist_exists(artist_id=artist_id):
                        logger.info('Found new artist: {}'.format(artist['name']))

                        related_artists_ = spotify_client.get_related_artists(artist_id=artist_id)
                        if not related_artists_:
                            continue

                        top_tracks = spotify_client.get_top_tracks(artist_id=artist_id)
                        if not top_tracks:
                            continue

                        neo4j_client.index_artist(
                            artist=artist, related_artists=related_artists, genres=artist.get('genres'))

                        top_track_ids = [top_track['id'] for top_track in top_tracks]
                        top_track_audio_features = spotify_client.get_audio_features_for_tracks(track_ids=top_track_ids)
                        TopTracks.insert_or_update_tracks(
                            artist_id=artist_id, top_tracks=top_tracks, audio_features=top_track_audio_features)
        except Exception as e:
            logger.exception(e)


def _get_seed_artist():
    spotify_client = Spotify.get_basic_client()
    while True:
        choice = random.randint(0, 1)
        if choice == 0:
            # Select artist from random search
            query = ''
            for _ in range(random.randint(1, 3)):
                query += random.choice(string.ascii_lowercase)
            random_wildcard_pos = random.randint(0, len(query))
            query = '{}*{}'.format(query[:random_wildcard_pos], query[random_wildcard_pos:])
            search_results = spotify_client.search(q=query, type='artist', limit=50)
            for artist in search_results['artists']['items'] or ():
                if not neo4j_client.artist_exists(artist_id=artist['id']):
                    return artist['id']
        elif choice == 1:
            # Select artist from genre-seeded track recommendations
            genre_seed = random.choice(spotify_client.recommendation_genre_seeds()['genres'])
            genre_recommendations = spotify_client.recommendations(seed_genres=[genre_seed], limit=100)
            for track in genre_recommendations['tracks'] or ():
                for artist in track['artists'] or ():
                    if not neo4j_client.artist_exists(artist_id=artist['id']):
                        return artist['id']


if __name__ == '__main__':
    utils.init_logger()

    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--run-mode', type=str, choices=('discover', 'update'), required=True,
        help='Discover mode - For indexing new artists. Update mode - For updating previously indexed artists.')
    parser.add_argument(
        '--num-workers', type=int, default=4, required=False, help='Only for discover mode')
    parser.add_argument(
        '--search-time-limit', type=int, required=False,
        help='Search will restart with new seed artist after X seconds (only for discover mode)')
    parser.add_argument(
        '--no-progress-time-limit', type=int, required=False,
        help='Search will restart with new seed artist if nothing has been indexed for '
             'X seconds (only for discover mode)')
    parser.add_argument(
        '--artist-cache-size', type=int, default=500000, required=False,
        help='Number of items to hold in artist LRU cache - to limit memory consumption (only for discover mode)')
    parser.add_argument(
        '--run-time-limit', type=int, required=False,
        help='Process will be stopped after X seconds (only for discover mode)')
    args = parser.parse_args()

    if args.run_mode == 'update':
        args.num_workers = 1

    _visited = utils.ConcurrentSet()
    with ThreadPoolExecutor(max_workers=args.num_workers) as executor:
        futures = []
        for _ in range(args.num_workers):
            if args.run_mode == 'discover':
                future = executor.submit(run_discover, _visited, args.artist_cache_size, args.search_time_limit,
                                         args.no_progress_time_limit, args.run_time_limit)
            elif args.run_mode == 'update':
                future = executor.submit(run_update, _visited)
            futures.append(future)
        wait(futures)
