from tendersaucer.db.utils import execute, fetch_all, handle_list_params
from tendersaucer.db.tendersaucer import CONNECTION_POOL


def get_tracks(artist_ids, tempo_range, release_year_range, danceability_range):
    query = '''
        SELECT
            DISTINCT id
        FROM
            tendersaucer.top_tracks
        WHERE
            artist_id IN (%(artist_ids)s) AND
            tempo >= %(tempo_min)s AND
            tempo <= %(tempo_max)s AND
            release_year BETWEEN (%(min_release_year)s AND %(max_release_year)s) AND
            danceability >= %(danceability_min)s AND
            danceability <= %(danceability_max)s
    '''
    params = {
        'artist_ids': artist_ids,
        'tempo_min': tempo_range[0],
        'tempo_max': tempo_range[1],
        'release_year_min': release_year_range[0],
        'release_year_max': release_year_range[1],
        'danceability_min': danceability_range[0],
        'danceability_max': danceability_range[1]
    }
    query, params = handle_list_params(query=query, params=params)
    rows = fetch_all(pool=CONNECTION_POOL, query=query, params=params)
    for row in rows:
        yield row['id']


def get_artists_with_tracks(artist_ids):
    query = '''
        SELECT
            DISTINCT artist_id
        FROM
            tendersaucer.top_tracks
        WHERE
            artist_id IN (%(artist_ids)s)
    '''
    params = {
        'artist_ids': artist_ids
    }
    query, params = handle_list_params(query=query, params=params)
    rows = fetch_all(pool=CONNECTION_POOL, query=query, params=params)
    return {row['artist_id'] for row in rows}


def insert_or_update_tracks(artist_id, top_tracks, audio_features):
    statements, params = [], {}
    for index, top_track in enumerate(top_tracks):
        track_id = top_track['id']
        release_year = (top_track.get('album') or {}).get('release_date') or None
        if release_year:
            release_year = int(release_year.split('-')[0])

        tempo, danceability = None, None
        for audio_features_obj in audio_features:
            if audio_features_obj and audio_features_obj['id'] == track_id:
                tempo = audio_features_obj.get('tempo') or None
                if tempo:
                    tempo = int(tempo)
                danceability = audio_features_obj.get('danceability')
                if danceability is not None:
                    danceability = int(danceability * 100)
                break

        statement = '''
            INSERT INTO
                tendersaucer.top_tracks 
                (id, artist_id, release_year, tempo, danceability)
            VALUES
                (%(id{index})s, %(artist_id)s, %(release_year{index})s, %(tempo{index})s, %(danceability{index})s)
            ON DUPLICATE KEY UPDATE
                release_year = %(release_year{index})s,
                tempo = %(tempo{index})s,
                danceability = %(danceability{index})s;
        '''.format(index=index)
        statements.append(statement)
        params.update({
            'id%d' % index: track_id,
            'artist_id': artist_id,
            'release_year%d' % index: release_year,
            'tempo%d' % index: tempo,
            'danceability%d' % index: danceability
        })
        pass
    statement = '\n'.join(statements)
    execute(pool=CONNECTION_POOL, statement=statement, params=params, multi=True)
