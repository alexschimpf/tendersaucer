class TopBar extends React.Component {
    render() {
        return (
            <div className="top-bar-div">
                <img src="static/images/tendersaucer.jpg" className="top-bar-logo"></img>
                <h3 className="top-bar-title">TENDERSAUCER</h3>
                { IS_LOGGED_IN ?
                    <button className="build-playlist-btn">Build Playlist</button> :
                    <button className="build-playlist-btn">Login</button>
                }

            </div>
        )
    }
}

export default TopBar;
