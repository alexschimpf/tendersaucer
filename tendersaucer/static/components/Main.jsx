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
            playlistType: 'genre'
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
                </table>
            </div>
        )
    }
}

export default Main;
