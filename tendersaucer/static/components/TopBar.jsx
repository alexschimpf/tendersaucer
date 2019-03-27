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
                <h3 style={{
                    display: 'inline-block', fontSize: '20px',
                    color: 'white', float: 'right', paddingTop: '30px',
                    margin: '0', marginRight: '40px'}}>Build Playlist</h3>
            </div>
        )
    }
}

export default TopBar;
