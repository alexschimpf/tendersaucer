import ReactTooltip from 'react-tooltip';


class SideBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlistType: 'artist'
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
                <button
                    className={"btn default genre-playlist-type-btn " +
                                (this.state.playlistType === 'artist' ? 'selected-btn' : '')}
                    onClick={() => this.onPlaylistTypeChanged('artist')}
                    data-tip="Build a playlist based on one or more artists">Artists</button>
                <br></br>
                <button
                    className={"btn default " +
                                (this.state.playlistType === 'genre' ? 'selected-btn' : '')}
                    onClick={() => this.onPlaylistTypeChanged('genre')}
                    data-tip="Build a playlist based on one or more genres">Genres</button>
            </div>
        )
    }
}

export default SideBar;
