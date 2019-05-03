import axios from 'axios';
import Loader from 'react-loader-spinner';


class FavoriteArtistsPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timeRange: null,
            isLoading: false,
            results: []
        }

        this.onTimeRangeSelected = this.onTimeRangeSelected.bind(this);
    }

    componentDidMount() {
        this.onTimeRangeSelected('medium');
    }

    onTimeRangeSelected(timeRange) {
        if (this.state.timeRange === timeRange) {
            return;
        }

        this.setState({
            timeRange: timeRange,
            isLoading: true
        });
        axios.get('/user_top_artists', {
            params: {
                time_range: timeRange
            }
        }).then(response => {
            if (this.state.timeRange !== timeRange) {
                return;
            }

            let artists = response.data.top_artists;
            if (!artists || !artists.length) {
                artists = <h3>Sorry, we couldn\'t determine your favorite artists.</h3>;
            }
            this.setState({
                results: artists.map(artist => <h3 key={artist}>{artist}</h3>)
            });
        }).catch(error => {
            this.setState({
                results: <h3>There was an error getting your favorite artists. Please try again.</h3>
            })
        }).finally(() => {
            this.setState({
                isLoading: false
            });
        });
    }

    render() {
        return (
            <div>
                <div className="favorite-artists-popup-time-ranges-div">
                    <div>
                        <button className={'favorite-artists-popup-btn ' +
                                           (this.state.timeRange === 'short' ? 'popup-selected-time-period ' : '')}
                                           onClick={() => this.onTimeRangeSelected('short')}>Short Term</button>
                        <button className={'favorite-artists-popup-btn ' +
                                           (this.state.timeRange === 'medium' ? 'popup-selected-time-period ' : '')}
                                           onClick={() => this.onTimeRangeSelected('medium')}>Medium Term</button>
                        <button className={'favorite-artists-popup-btn ' +
                                           (this.state.timeRange === 'long' ? 'popup-selected-time-period ' : '')}
                                           onClick={() => this.onTimeRangeSelected('long')}>Long Term</button>
                    </div>
                </div>
                <div className="favorite-artists-popup-artists-div">
                {
                    this.state.isLoading ?
                        <div>
                            <h3>Hang tight. This could take a minute.</h3>
                            <Loader type="Oval" color="orange" height="50" width="50" />
                        </div> :
                        <div>
                            {this.state.results}
                        </div>
                }
                </div>
            </div>
        )
    }
}

export default FavoriteArtistsPopup;
