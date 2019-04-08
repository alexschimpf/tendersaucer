import ReactTooltip from 'react-tooltip';


class SideBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlistType: 'favorite_artists'
        };

        this.onPlaylistTypeChanged = this.onPlaylistTypeChanged.bind(this);
        this.onPlaylistNameChanged = this.onPlaylistNameChanged.bind(this);
    }

    onPlaylistTypeChanged(playlistType) {
        this.setState({
            playlistType: playlistType
        });
        this.props.onFormChanged('playlistType', playlistType);
    }

    onPlaylistNameChanged(event) {
        this.props.onFormChanged('playlistName', event.target.value);
    }

    render() {
        return (
            <div className="side-bar-div">
                <ReactTooltip effect="solid" className="tooltip"/>
                <h3>Playlist Name</h3>
                <input className="playlist-name" type="text"
                       onChange={this.onPlaylistNameChanged}></input>
                <h3>Playlist Type</h3>
                <button className="btn default genre-playlist-type-btn"
                    style={{background: this.state.playlistType == 'favorite_artists' ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.onPlaylistTypeChanged('favorite_artists')}
                    data-tip="Build a playlist based on artists you listen to the most">Favorite Artists</button>
                <br></br>
                <button className="btn default"
                    style={{background: this.state.playlistType == 'genre' ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.onPlaylistTypeChanged('genre')}
                    data-tip="Build a playlist based on one or more genres">Genres</button>
            </div>
        )
    }
}

export default SideBar;
