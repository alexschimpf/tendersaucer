class TopBar extends React.Component {
    render() {
        return (
            <div className="top-bar-div">
                <img src="static/images/tendersaucer.jpg" className="top-bar-logo"></img>
                <h3 className="top-bar-title">TENDERSAUCER</h3>
                <button className="build-playlist-btn">Build Playlist</button>
            </div>
        )
    }
}

export default TopBar;
