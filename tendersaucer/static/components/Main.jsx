import axios from 'axios';
import { Spring } from 'react-spring/renderprops';
import TopBar from './TopBar';
import SideBar from './SideBar';
import GenreCriteria from './GenreCriteria';
import ArtistCriteria from './ArtistCriteria';
import Loader from 'react-loader-spinner';
import Popup from 'react-popup';


class Main extends React.Component {

    constructor(props) {
        super(props);

        let currYear = (new Date()).getFullYear();
        this.state = {
            playlistType: 'artist',
            artistPopularity: [0, 100],
            trackReleaseYear: [1900, currYear],
            trackTempo: [80, 160],
            trackDanceability: [0, 100],
            adventurousness: 0,
            genres: [],
            artists: [],
            tableClassName: null,
            isLoading: false
        };

        this.onFormChanged = this.onFormChanged.bind(this);
        this.buildPlaylist = this.buildPlaylist.bind(this);
        this.showBasicPopup = this.showBasicPopup.bind(this);
        this.checkRequiredFields = this.checkRequiredFields.bind(this);
        this.setProgressInterval = this.setProgressInterval.bind(this);
        this.showProcessingPopup = this.showProcessingPopup.bind(this);
        this.showSuccessPopup = this.showSuccessPopup.bind(this);
        this.onLoadingChanged = this.onLoadingChanged.bind(this);
    }

    onFormChanged(key, value) {
        this.setState({
            [key]: value
        });
    }

    onLoadingChanged(isLoading) {
        this.setState({
            isLoading: isLoading
        });
    }

    buildPlaylist() {
        let errorMessage = this.checkRequiredFields();
        if (errorMessage) {
            this.showBasicPopup('Whoa there!', errorMessage);
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
                included_artists: this.state.artists.join(','),
                max_search_depth: Number(this.state.adventurousness)
            }
        }).then(response => {
            let taskId = response.data.task_id;
            let progressInterval = this.setProgressInterval(taskId);
            this.setState({
                taskId: taskId,
                progressInterval: progressInterval,
                isLoading: true
            });

            this.showProcessingPopup();
        }).catch(error => {
            console.log(error);
            this.showBasicPopup('Oops!', 'There was a problem generating your playlist. Please try again.');
        });
    }

    setProgressInterval(taskId) {
        return setInterval(() => {
            axios.get('/task/' + taskId + '/status').then(response => {
                if (response.data.progress === 100) {
                    clearInterval(this.state.progressInterval);
                    this.setState({
                        taskId: null,
                        progressInterval: null,
                        isLoading: false,
                        message: response.data.message
                    });

                    Popup.close();

                    if (response.data.state === 'SUCCESS') {
                        this.showSuccessPopup(response.data.message);
                    } else {
                        this.showBasicPopup('Oops!', response.data.message);
                    }
                }
            });
        }, 1000);
    }

    checkRequiredFields() {
        let errorMessage = null;
        if (!this.state.playlistName) {
            errorMessage = 'Please provide a playlist name.';
        } else if (this.state.playlistType == 'genre') {
            if (!this.state.genres || !this.state.genres.length) {
                errorMessage = 'Please select at least one genre.';
            }
        } else if (this.state.playlistType == 'artist') {
            if (!this.state.artists || !this.state.artists.length) {
                errorMessage = 'Please select at least one artist.'
            }
        }

        return errorMessage;
    }

    showBasicPopup(title, message) {
        Popup.create({
            title: title,
            content: (
                <div>
                    <h3>{message}</h3>
                </div>
            )
        });
    }

    showProcessingPopup() {
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
    }

    showSuccessPopup(message) {
        Popup.create({
            title: 'Success!',
            content: (
                <div>
                    <h3>{message}</h3>
                    <div className="success-disclaimer">
                        There may be a slight delay before your playlist shows up in your Spotify account.
                    </div>
                </div>
            )
        });
    }

    render() {
        return (
            <div>
                <Popup closeOnOutsideClick={false} closeBtn={!this.state.isLoading} />
                <div className="main-grid">
                    <TopBar onLoadingChanged={this.onLoadingChanged} />
                    {
                        IS_LOGGED_IN &&
                            <SideBar onFormChanged={this.onFormChanged} />
                    }
                    {
                        IS_LOGGED_IN ?
                            <div>
                            {
                                this.state.playlistType == 'genre' ?
                                    <GenreCriteria onFormChanged={this.onFormChanged} /> :
                                    <ArtistCriteria onFormChanged={this.onFormChanged} />
                            }
                                <button className="btn default build-playlist-btn"
                                    onClick={this.buildPlaylist}>Build Playlist</button>
                            </div> :
                            <div className="pre-login-msg-div">
                                <h3 className="pre-login-msg">
                                    Tendersaucer lets you generate custom Spotify playlists
                                    based on different criteria like genre, artist popularity,
                                    tempo, etc.
                                </h3><br></br>
                                <h3 className="pre-login-msg">
                                    <span>Please <a href="/get_spotify_auth">log in</a> to your Spotify account to continue.</span>
                                </h3>
                            </div>
                    }
                    <div className="footer">
                        <p>&copy; {(new Date()).getFullYear()} Alex Schimpf</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default Main;
