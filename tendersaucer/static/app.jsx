import React from 'react';
import ReactDOM from 'react-dom';
import { Spring } from 'react-spring/renderprops';
import axios from 'axios';
import './css/app.css';
import './html/index.html';
import TopBar from './components/TopBar';
import SideBar from './components/SideBar';
import GenreCriteria from './components/GenreCriteria';
import FavoriteArtistsCriteria from './components/FavoriteArtistsCriteria';


if (window.location.hash) {
    window.location = window.location.href.split('#')[0];
}

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
                <table style={{width: '100%'}}>
                    <tbody>
                        <tr>
                            <th style={{
                                    width: '30%', borderRightColor: 'salmon',
                                    borderRightStyle: 'solid', borderRightWidth: '1px', position: 'fixed'}}>
                                <SideBar onPlaylistTypeChanged={this.onPlaylistTypeChanged} />
                            </th>

                            <th style={{width: '5%'}}></th>

                            <th style={{width: '50%'}}>
                                {
                                    this.state.playlistType == 'genre' ?
                                        <GenreCriteria genres={GENRE_OPTIONS} /> :
                                        <FavoriteArtistsCriteria />
                                }
                            </th>

                            <th style={{width: '15%'}}></th>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

ReactDOM.render(
    <div>
        <Main />
    </div>,
    document.getElementById('root')
);
