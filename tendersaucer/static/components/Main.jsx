import { Spring } from 'react-spring/renderprops';
import axios from 'axios';
import TopBar from './TopBar';
import SideBar from './SideBar';
import GenreCriteria from './GenreCriteria';
import FavoriteArtistsCriteria from './FavoriteArtistsCriteria';


const GENRE_OPTIONS = [];
for (let genre of GENRES) {
    GENRE_OPTIONS.push({
        label: genre.toUpperCase(),
        value: genre
    });
}

class Main extends React.Component {
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
        })
    }

    render() {
        return (
            <div>
                <TopBar />
                { IS_LOGGED_IN ?
                    <table className="main-table">
                        <tbody>
                            <tr>
                                <th className="side-bar-section">
                                    <SideBar onPlaylistTypeChanged={this.onPlaylistTypeChanged} />
                                </th>

                                <th className="criteria-section">
                                    {
                                        this.state.playlistType == 'genre' ?
                                            <GenreCriteria genres={GENRE_OPTIONS} /> :
                                            <FavoriteArtistsCriteria />
                                    }
                                </th>
                            </tr>
                        </tbody>
                    </table> :
                    <div style={{textAlign: 'center', width: '100%'}}>
                        <h3 style={{width: '40%', margin: '0 auto'}}>Tendersaucer let's you generate custom Spotify playlists based on different criteria like genre, artist popularity, tempo, etc. Please login to your Spotify account to continue.</h3>
                    </div>
                }
            </div>
        )
    }
}

export default Main;
