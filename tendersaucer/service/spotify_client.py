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

    def get_user_top_artists(self, time_ranges):
        user_top_artists = []
        for time_range in time_ranges:
            top_artists = self.current_user_top_artists(time_range=time_range)
            while top_artists:
                user_top_artists.extend(top_artists)
                top_artists = self.next(top_artists)

        return user_top_artists

    def get_artists_from_user_playlists(self):
        user_playlist_artist_ids = set()
        user_id = self.current_user()['id']
        playlists = self.current_user_playlists()
        while playlists:
            for playlist in playlists['items']:
                if playlist['owner']['id'] != user_id:
                    continue

                playlist_tracks = self.user_playlist_tracks(
                    user=user_id, playlist_id=playlist['id'])
                while playlist_tracks:
                    for item in playlist_tracks['items']:
                        track_artists = item['track']['artists']
                        artist_ids = [artist['id'] for artist in track_artists if artist['id']]
                        user_playlist_artist_ids.update(artist_ids)
                    playlist_tracks = self.next(playlist_tracks)
            playlists = self.next(playlists)

        return user_playlist_artist_ids
