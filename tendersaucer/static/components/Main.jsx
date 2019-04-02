import { Spring } from 'react-spring/renderprops';
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
            playlistType: 'favorite_artists',
            artistPopularity: [],
            trackReleaseYear: [],
            trackTempo: [],
            trackDanceability: [],
            adventurousness: 3,
            artistTimeRanges: [],
            genres: []
        };

        this.onFormChanged = this.onFormChanged.bind(this);
    }

    onFormChanged(key, value) {
        this.setState({
            [key]: value
        });
    }

    render() {
        return (
            <div>
                <TopBar formData={this.state} />
                { IS_LOGGED_IN ?
                    <table className="main-table">
                        <tbody>
                            <tr>
                                <th className="side-bar-section">
                                    <SideBar onFormChanged={this.onFormChanged} />
                                </th>

                                <th className="criteria-section">
                                    {
                                        this.state.playlistType == 'genre' ?
                                            <GenreCriteria genres={GENRE_OPTIONS} onFormChanged={this.onFormChanged} /> :
                                            <FavoriteArtistsCriteria onFormChanged={this.onFormChanged} />
                                    }
                                </th>
                            </tr>
                        </tbody>
                    </table> :
                    <div className="pre-login-msg-div">
                        <h3 className="pre-login-msg">Tendersaucer let's you generate custom Spotify playlists
                                                      based on different criteria like genre, artist popularity,
                                                      tempo, etc. Please log in to your Spotify account to continue.</h3>
                    </div>
                }
            </div>
        )
    }
}

export default Main;
