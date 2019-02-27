import os
import spotipy
from tendersaucer.config import APP_CONFIG
from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials


class Spotify(spotipy.Spotify):
    SPOTIFY_CLIENT_ID = \
        APP_CONFIG.get('spotify', {}).get('client_id') or \
        os.getenv('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = \
        APP_CONFIG.get('spotify', {}).get('client_secret') or \
        os.getenv('SPOTIFY_CLIENT_SECRET')

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
