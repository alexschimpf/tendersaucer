import axios from 'axios';
import { Spring } from 'react-spring/renderprops';
import TopBar from './TopBar';
import SideBar from './SideBar';
import GenreCriteria from './GenreCriteria';
import FavoriteArtistsCriteria from './FavoriteArtistsCriteria';
import Loader from 'react-loader-spinner';
import Popup from 'react-popup';


const GENRE_OPTIONS = [];
for (let genre of GENRES) {
    GENRE_OPTIONS.push({
        label: genre.charAt(0).toUpperCase() + genre.slice(1),
        value: genre
    });
}

class Main extends React.Component {

    constructor(props) {
        super(props);

        let currYear = (new Date()).getFullYear();
        this.state = {
            playlistType: 'favorite_artists',
            artistPopularity: [0, 100],
            trackReleaseYear: [1900, currYear],
            trackTempo: [0, 250],
            trackDanceability: [0, 100],
            adventurousness: 3,
            artistTimeRanges: [],
            genres: [],
            tableClassName: null
        };

        this.onFormChanged = this.onFormChanged.bind(this);
        this.onBuildPlaylist = this.onBuildPlaylist.bind(this);
    }

    onFormChanged(key, value) {
        this.setState({
            [key]: value
        });
    }

    onBuildPlaylist() {
        let self = this;

        let errorMessage = null;
        if (!this.state.playlistName) {
            errorMessage = 'Please provide a playlist name.';
        } else if (this.state.playlistType == 'genre') {
            if (!this.state.genres || !this.state.genres.length) {
                errorMessage = 'Please select at least one genre.';
            }
        } else {
            if (!this.state.artistTimeRanges || !this.state.artistTimeRanges.length) {
                errorMessage = 'Please select at least one artist time range.';
            }
        }

        if (errorMessage) {
            Popup.create({
                title: 'Whoa there!',
                content: (
                    <div>
                        <h3>{errorMessage}</h3>
                    </div>
                )
            });
            return;
        }

        axios.get('/build_playlist', {
            params: {
                playlist_name: this.state.playlistName,
                playlist_type: this.state.playlistType,
                artist_popularity_range: this.state.artistPopularity.join(','),
                track_release_year_range: this.state.trackReleaseYear.join(','),
                track_danceability_range: this.state.trackDanceability.join(','),
                track_tempo_range: this.state.trackTempo.join(','),
                included_genres: this.state.genres.join(','),
                max_search_depth: Number(this.state.adventurousness),
                time_ranges: this.state.artistTimeRanges.join(',')
            }
        }).then(response => {
            let taskId = response.data.task_id;
            let progressInterval = setInterval(() => {
                axios.get('/task/' + taskId + '/status').then(response => {
                    if (response.data.progress === 100) {
                        clearInterval(this.state.progressInterval);
                        this.setState({
                            taskId: null,
                            progressInterval: null,
                            message: response.data.message
                        });

                        Popup.close();

                        if (response.data.state === 'SUCCESS') {
                            Popup.create({
                                title: 'Success!',
                                content: (
                                    <div>
                                        <h3>{response.data.message}</h3>
                                        <div className="success-disclaimer">
                                            (There may be a slight delay before your playlist shows up in your Spotify account.)
                                        </div>
                                    </div>
                                )
                            });
                        } else {
                            Popup.create({
                                title: 'Oops!',
                                content: (
                                    <div>
                                        <h3>{response.data.message}</h3>
                                    </div>
                                )
                            });
                        }

                    }
                });
            }, 1000);

            self.setState({
                taskId: taskId,
                progressInterval: progressInterval
            })

            Popup.create({
                title: 'Processing',
                content: (
                    <div className="loader-div">
                        <h3>Hang tight. This could take a minute.</h3>
                        <div>
                            <Loader type="Oval" color="orange" height="50" width="50" />
                        </div>
                    </div>
                )
            });
        }).catch(error => {
            console.log(error);

            Popup.create({
                title: 'Oops!',
                content: (
                    <div>
                        <h3>There was a problem generating your playlist. Please try again.</h3>
                    </div>
                )
            });
        });
    }

    render() {
        return (
            <div>
                <Popup closeBtn={!this.state.taskId} closeOnOutsideClick={false} />
                <div className="main-grid">
                    <TopBar onBuildPlaylist={this.onBuildPlaylist} />
                    {
                        IS_LOGGED_IN &&
                            <SideBar onFormChanged={this.onFormChanged} />
                    }
                    {
                        IS_LOGGED_IN ?
                            (
                                this.state.playlistType == 'genre' ?
                                    <GenreCriteria genres={GENRE_OPTIONS} onFormChanged={this.onFormChanged} /> :
                                    <FavoriteArtistsCriteria onFormChanged={this.onFormChanged} />
                            ) :
                            <div className="pre-login-msg-div">
                                <h3 className="pre-login-msg">
                                    Tendersaucer lets you generate custom Spotify playlists
                                    based on different criteria like genre, artist popularity,
                                    empo, etc. Please log in to your Spotify account to continue.
                                </h3>
                            </div>
                    }
                    <div className="footer">
                        <p>&copy; 2019 Tendersaucer</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Main;
