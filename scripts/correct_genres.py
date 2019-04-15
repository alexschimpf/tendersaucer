import json
import logging
import argparse
from tendersaucer import utils
from tendersaucer.service import neo4j_client


logger = logging.getLogger('scripts.correct_genres')

BASE_GENRES = [
    'rock', 'pop', 'country', 'rap', 'hip hop', 'jazz', 'funk', 'electronic', 'trance', 'grunge', 'ska', 'worship',
    'blues', 'classical', 'metal', 'reggae', 'folk', 'punk', 'techno', 'house', 'dubstep', 'ambient', 'indie rock',
    'emo', 'experimental', 'r&b'
]


def main(dry_run):
    all_genres = neo4j_client.get_all_genres()

    genre_map = {}
    for base_genre in BASE_GENRES:
        if base_genre not in all_genres:
            logger.info('Warning: {} isn\'t a genre'.format(base_genre))
            continue
        for genre in all_genres:
            if genre != base_genre and (
                    (' ' + base_genre) in genre or (base_genre + ' ') in genre or
                    ('-' + base_genre) in genre or (base_genre + '-') in genre):
                try:
                    genre_map[base_genre].append(genre)
                except KeyError:
                    genre_map[base_genre] = [genre]

    if dry_run:
        logger.info(json.dumps(genre_map, indent=4, sort_keys=True))

    for base_genre in BASE_GENRES:
        new_genres = genre_map[base_genre]
        for new_genre in new_genres or ():
            genre_artists = neo4j_client.get_artists_from_genres(genres=(new_genre,))
            logger.info('Copying {} artists from {} to {}'.format(len(genre_artists), new_genre, base_genre))
            for genre_artist in genre_artists:
                if not dry_run:
                    neo4j_client.add_artist_genre_relationship(artist_id=genre_artist['id'], genre_name=base_genre)


if __name__ == '__main__':
    utils.init_logger()

    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    main(dry_run=args.dry_run)
