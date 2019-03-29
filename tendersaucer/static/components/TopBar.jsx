class TopBar extends React.Component {
    render() {
        return (
            <div style={{
                backgroundImage: 'linear-gradient(to right, darksalmon, salmon)',
                margin: '-10px', height: '80px', marginBottom: '40px'}}>
                <img src="static/images/tendersaucer.jpg" style={{
                    width: '80px',
                    paddingTop: '10px', float: 'left',
                    marginLeft: '40px'}}></img>
                <h3 style={{
                    display: 'inline-block', margin: '0', padding: '20px',
                    fontSize: '40px', color: 'white', paddingLeft: '10px'}}>TENDERSAUCER</h3>
                <button className="build-playlist-btn">Build Playlist</button>
            </div>
        )
    }
}

export default TopBar;
