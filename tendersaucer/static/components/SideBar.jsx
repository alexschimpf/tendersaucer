import ReactTooltip from 'react-tooltip';


class SideBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlistType: 'favorite_artists'
        };

        this.onPlaylistTypeChanged = this.onPlaylistTypeChanged.bind(this);
    }

    onPlaylistTypeChanged(playlistType) {
        this.setState({
            playlistType: playlistType
        });
        this.props.onPlaylistTypeChanged(playlistType);
    }

    render() {
        return (
            <div>
                <ReactTooltip effect="solid" className="tooltip"/>
                <h3>Playlist Name</h3>
                <input className="playlist-name" type="text"></input>
                <h3>Playlist Type</h3>
                <button className="btn genre-playlist-type-btn"
                    style={{background: this.state.playlistType == 'genre' ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.onPlaylistTypeChanged('genre')}
                    data-tip="Build a playlist based on one or more genres">Genres</button><br></br>
                <button className="btn default"
                    style={{background: this.state.playlistType == 'favorite_artists' ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.onPlaylistTypeChanged('favorite_artists')}
                    data-tip="Build a playlist based on artists you listen to the most">Favorite Artists</button>
            </div>
        )
    }
}

export default SideBar;
