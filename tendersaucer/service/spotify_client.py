import spotipy
from tendersaucer.config import APP_CONFIG
from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials


class Spotify(spotipy.Spotify):

    SPOTIFY_CLIENT_ID = APP_CONFIG['spotify']['client_id']
    SPOTIFY_CLIENT_SECRET = APP_CONFIG['spotify']['client_secret']

    @classmethod
    def get_oauth_client(cls):
        return SpotifyOAuth(
            client_id=cls.SPOTIFY_CLIENT_ID,
            client_secret=cls.SPOTIFY_CLIENT_SECRET,
            redirect_uri=APP_CONFIG['spotify']['redirect_url'],
            scope='playlist-modify-public playlist-read-private user-top-read')

    @classmethod
    def get_basic_client(cls):
        credentials = SpotifyClientCredentials(
            client_id=cls.SPOTIFY_CLIENT_ID, client_secret=cls.SPOTIFY_CLIENT_SECRET)
        return Spotify(client_credentials_manager=credentials)

    def get_related_artists(self, artist_id):
        return (self.artist_related_artists(artist_id=artist_id) or {}).get('artists') or ()

    def get_top_tracks(self, artist_id):
        return (self.artist_top_tracks(artist_id=artist_id) or {}).get('tracks') or ()

    def get_artist(self, artist_id):
        return self.artist(artist_id=artist_id)

    def get_artists(self, artist_ids):
        if not isinstance(artist_ids, list):
            artist_ids = list(artist_ids)

        i = 0
        result = []
        while i < len(artist_ids):
            end_index = min(i + 50, len(artist_ids))
            artists = self.artists(artists=artist_ids[i:end_index])
            result.extend(artists['artists'])
            i += 50

        return result

    def get_audio_features_for_tracks(self, track_ids):
        return self.audio_features(tracks=track_ids) or ()
