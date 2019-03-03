import time
import string
import random
import logging
import argparse
from lru import LRU
from tendersaucer import utils
from tendersaucer.db import track
from tendersaucer.service import neo4j_client
from tendersaucer.service.spotify_client import Spotify
from concurrent.futures import ThreadPoolExecutor, wait


logger = logging.getLogger('scripts.indexer')


def run_discover(visited, artist_cache_size, search_time_limit=None, no_progress_time_limit=None):
    artists_by_id = LRU(artist_cache_size)
    spotify_client = Spotify.get_basic_client()
    while True:
        try:
            start_time = time.time()
            last_index_time = time.time()

            artist_id = _get_seed_artist()
            stack = [artist_id]
            while stack:
                curr_time = time.time()
                if search_time_limit and curr_time - start_time > search_time_limit:
                    logger.info('Search time limit reached. Restarting search.')
                    break
                if no_progress_time_limit and curr_time - last_index_time > no_progress_time_limit:
                    logger.info('No progress is being made. Restarting search.')
                    break

                # Pop up to 50 unvisited artists from the stack
                artist_ids = set()
                pop_start_time = time.time()
                while stack and len(artist_ids) < 50 and (time.time() - pop_start_time) < 3:
                    artist_id = stack.pop()
                    if isinstance(artist_id, bytes):
                        artist_id = artist_id.decode('utf8')
                    if artist_id not in visited:
                        visited.add(artist_id)
                        artist_ids.add(artist_id)

                # Split out artists into new/cached/existing lists
                new_artist_ids = set()
                cached_artist_ids = set()
                existing_artist_ids = set()
                for artist_id in artist_ids:
                    if artist_id in artists_by_id:
                        cached_artist_ids.add(artist_id)
                    elif neo4j_client.artist_exists(artist_id=artist_id):
                        existing_artist_ids.add(artist_id)
                    else:
                        new_artist_ids.add(artist_id)

                # Fetch new artist ids via Spotify API (and add cached ones)
                new_artists = spotify_client.get_artists(artist_ids=new_artist_ids)
                for cached_artist_id in cached_artist_ids:
                    new_artist = artists_by_id[cached_artist_id]
                    new_artists.append(new_artist)

                all_related_artist_ids = set()

                # Get related artists from Redis for existing artists
                for existing_artist_id in existing_artist_ids:
                    related_artist_ids = neo4j_client.get_related_artist_ids(artist_id=existing_artist_id)
                    all_related_artist_ids.update(related_artist_ids)

                for new_artist in new_artists:
                    new_artist_id = new_artist['id']
                    if not new_artist['popularity']:
                        continue

                    related_artist_ids = set()
                    related_artists = spotify_client.get_related_artists(artist_id=new_artist_id)
                    if not related_artists:
                        continue

                    # Index new artists in redis
                    logger.info(new_artist['name'])
                    for related_artist in related_artists:
                        related_artist_id = related_artist['id']
                        related_artist_ids.add(related_artist_id)
                        artists_by_id[related_artist_id] = related_artist
                    all_related_artist_ids.update(related_artist_ids)
                    neo4j_client.index_artist(
                        artist_id=new_artist_id, related_artist_ids=related_artist_ids,
                        genres=new_artist.get('genres'))

                    # Add top tracks to database
                    top_tracks = spotify_client.get_top_tracks(artist_id=new_artist_id)
                    track.insert_or_update_tracks(artist_id=new_artist_id, top_tracks=top_tracks)

                    last_index_time = time.time()

                stack.extend(all_related_artist_ids - visited)
        except Exception as e:
            logger.exception(e)


def run_update(visited):
    pass


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
    parser.add_argument('--run-mode', type=str, choices=('discover', 'update'), required=True,
                        help='Discover mode - For indexing new artists.'
                             'Update mode - For updating previously indexed artists.')
    parser.add_argument('--num-workers', type=int, default=4, required=False)
    parser.add_argument('--search-time-limit', type=int, required=False,
                        help='Search will restart with new seed artist after X seconds')
    parser.add_argument('--no-progress-time-limit', type=int, required=False,
                        help='Search will restart with new seed artist if nothing has been indexed for X seconds')
    parser.add_argument('--artist-cache-size', type=int, default=500000, required=False,
                        help='Number of items to hold in artist LRU cache (to limit memory consumption)')
    args = parser.parse_args()

    if args.run_mode == 'update':
        args.num_workers = 1

    visited = utils.ConcurrentSet()
    with ThreadPoolExecutor(max_workers=args.num_workers) as executor:
        futures = []
        for _ in range(args.num_workers):
            if args.run_mode == 'discover':
                future = executor.submit(run_discover, visited, args.artist_cache_size, args.search_time_limit,
                                         args.no_progress_time_limit)
            elif args.run_mode == 'update':
                future = executor.submit(run_update, visited)
            futures.append(future)
        wait(futures)
