class SideBar extends React.Component {
    render() {
        return (
            <div>
                <h3>PLAYLIST NAME</h3>
                <input className="playlist-name" type="text"></input>
                <h3>PLAYLIST TYPE</h3>
                <button className="btn default" style={{marginTop: '5px'}}
                    onClick={() => this.props.onPlaylistTypeChanged('genre')}>GENRES</button><br></br>
                <button className="btn default"
                    onClick={() => this.props.onPlaylistTypeChanged('favorite_artists')}>FAVORITE ARTISTS</button>
            </div>
        )
    }
}

export default SideBar;
