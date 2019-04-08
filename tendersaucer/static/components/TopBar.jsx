import axios from 'axios';
import {default as Menu} from 'reactjs-popup';
import Loader from 'react-loader-spinner';
import Popup from 'react-popup';


class TopBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.logout = this.logout.bind(this);
        this.showLoadingPopup = this.showLoadingPopup.bind(this);
        this.showFavoriteArtists = this.showFavoriteArtists.bind(this);
        this.showFavoriteGenres = this.showFavoriteGenres.bind(this);
    }

    showLoadingPopup() {
        Popup.create({
            title: 'Loading',
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

    showFavoriteArtists() {
        this.showLoadingPopup();
        this.props.onLoadingChanged(true);
        axios.get('/user_top_artists').then(response => {
            let artists = response.data.top_artists;
            artists = artists.map(artist =>
                <h3 key={artist}>{artist}</h3>
            );

            Popup.close();
            Popup.create({
                title: 'Your Favorite Artists',
                content: (
                    <div>
                        {artists}
                    </div>
                )
            });
        }).catch(error => {
            Popup.close();
            Popup.create({
                title: 'Oops!',
                content: (
                    <h3>There was an error getting your favorite artists. Please try again.</h3>
                )
            });
        }).finally(() => {
            this.props.onLoadingChanged(false);
        });
    }

    showFavoriteGenres() {
        this.showLoadingPopup();
        this.props.onLoadingChanged(true);
        axios.get('/user_top_genres').then(response => {
            let genres = response.data.top_genres;
            genres = genres.map(genre =>
                <h3 key={genre}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h3>
            );

            Popup.close();
            Popup.create({
                title: 'Your Favorite Genres',
                content: (
                    <div>
                        {genres}
                    </div>
                )
            });
        }).catch(error => {
            Popup.close();
            Popup.create({
                title: 'Oops!',
                content: (
                    <h3>There was an error getting your favorite genres. Please try again.</h3>
                )
            });
        }).finally(() => {
            this.props.onLoadingChanged(false);
        });
    }

    logout() {
        axios.get('/logout').then(response => {
            location.reload();
        });
    }

    render() {
        return (
            <div className="top-bar-div">
                <img src="static/images/tendersaucer.jpg" className="top-bar-logo"></img>
                <h3 className="top-bar-title">Tendersaucer</h3>
                {
                    IS_LOGGED_IN &&
                        <button className="top-bar-btn build-playlist-btn" onClick={this.props.onBuildPlaylist}>Build Playlist</button>
                }
                {
                    IS_LOGGED_IN &&
                        <Menu
                            trigger={<img src="static/images/caret-down.png" className="top-bar-btn"></img>}
                            position="bottom center" on="click" mouseLeaveDelay={300} mouseEnterDelay={0}
                            contentStyle={{ padding: '0px', border: 'none', width: '160px' }} arrow={false} closeOnDocumentClick>
                            <div className="account-menu">
                                <button className="account-menu-btn" onClick={this.showFavoriteArtists}>Your Favorite Artists</button><br></br>
                                <button className="account-menu-btn" onClick={this.showFavoriteGenres}>Your Favorite Genres</button><br></br>
                                <button className="account-menu-btn" onClick={this.logout}>Logout</button>
                            </div>
                        </Menu>
                }
                {
                    !IS_LOGGED_IN &&
                        <button className="top-bar-btn login-btn" onClick={() => location.href = '/get_spotify_auth'}>Login</button>
                }
            </div>
        )
    }
}

export default TopBar;
