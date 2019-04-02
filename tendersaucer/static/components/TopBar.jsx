import axios from 'axios';


class TopBar extends React.Component {

    constructor(props) {
        super(props);

        this.buildPlaylist = this.buildPlaylist.bind(this);
    }

    buildPlaylist() {
        let self = this;
        let formData = this.props.formData;
        axios.get('/build_playlist', {
            params: {
                playlist_name: formData.playlistName,
                playlist_type: formData.playlistType,
                artist_popularity_range: formData.artistPopularity.join(','),
                track_release_year_range: formData.trackReleaseYear.join(','),
                track_danceability_range: formData.trackDanceability.join(','),
                track_tempo_range: formData.trackTempo.join(','),
                included_genres: formData.genres.join(','),
                max_search_depth: Number(formData.adventurousness),
                time_ranges: formData.artistTimeRanges.join(',')
            }
        }).then(response => {
            let taskId = response.data.task_id;
            let progressInterval = setInterval(() => {
                axios.get('/task/' + taskId + '/status').then(response => {
                    if (response.data.progress === 100) {
                        this.setState({
                            taskId: null,
                            progressInterval: null,
                            isBuildFinished: true
                        });
                        clearInterval(this.state.progressInterval)
                    }
                });
            }, 1000);

            self.setState({
                taskId: taskId,
                progressInterval: progressInterval
            })
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="top-bar-div">
                <img src="static/images/tendersaucer.jpg" className="top-bar-logo"></img>
                <h3 className="top-bar-title">TENDERSAUCER</h3>
                { IS_LOGGED_IN ?
                    <button className="top-bar-btn" onClick={this.buildPlaylist}>Build Playlist</button> :
                    <button className="top-bar-btn" onClick={() => location.href = '/get_spotify_auth'}>Login</button>
                }
            </div>
        )
    }
}

export default TopBar;
