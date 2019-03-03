from tendersaucer.db.utils import execute
from tendersaucer.db.tendersaucer import CONNECTION_POOL


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
