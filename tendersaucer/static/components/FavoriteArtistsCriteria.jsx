import 'rc-slider/assets/index.css';
import InfoIcon from './InfoIcon';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';


const Range = createSliderWithTooltip(Slider.Range);
const SliderWithTooltip = createSliderWithTooltip(Slider);


class FavoriteArtistsCriteria extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            artistTimeRanges: []
        };

        this.addOrRemoveArtistTimeRange = this.addOrRemoveArtistTimeRange.bind(this);
    }

    addOrRemoveArtistTimeRange(timeRange) {
        let newArtistTimeRanges = this.state.artistTimeRanges.slice();
        let timeRangeIndex = newArtistTimeRanges.indexOf(timeRange);
        if (timeRangeIndex > -1) {
            newArtistTimeRanges.splice(timeRangeIndex, 1);
        } else {
            newArtistTimeRanges.push(timeRange);
        }
        this.setState({
            artistTimeRanges: newArtistTimeRanges
        })
    }

    render() {
        return (
            <div>
                <ReactTooltip effect="solid" className="tooltip"/>
                <table>
                    <tbody>
                        <tr>
                            <th>
                                <h3 className="param-header">Artist Popularity</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                    handleStyle={{borderColor: 'salmon'}}
                                    trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Release Year</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[1900, 2019]} min={1900} max={2019}
                                    handleStyle={{borderColor: 'salmon'}}
                                    trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Tempo</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 250]} min={0} max={250}
                                    handleStyle={{borderColor: 'salmon'}}
                                    trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Danceability</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                    handleStyle={{borderColor: 'salmon'}}
                                    trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <span className="param-header">
                                    <h3 className="info-icon-param-header">Adventurousness</h3>
                                    <InfoIcon message="This scale represents how much you want your playlist to
                                                       deviate from your favorite artists. 0 means you only want
                                                       listen to artists you know. 3 means you're willing to listen
                                                       to artists who are more different than your favorite artists." />
                                </span>
                            </th>
                            <th>
                                <SliderWithTooltip className="slider" defaultValue={3} min={0} max={3}
                                    handleStyle={{borderColor: 'salmon'}}
                                    trackStyle={{backgroundColor: 'salmon'}}
                                    railStyle={{backgroundColor: 'salmon'}}/>
                            </th>
                        </tr>
                    </tbody>
                </table>

                <span className="param-header-outside-table" style={{marginTop: '5px'}}>
                    <h3 className="info-icon-param-header">Artist Time Range</h3>
                    <InfoIcon message="This is used to help identify your favorite artists -
                                       whether or not to consider artists you've listened
                                       to in the short term, medium term, and/or long term." />
                </span>

                <button className="btn default artist-time-range-first-btn"
                    style={{background: this.state.artistTimeRanges.indexOf('short_term') > -1 ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.addOrRemoveArtistTimeRange('short_term')}>Short Term</button>
                <button className="btn default artist-time-range-btn"
                    style={{background: this.state.artistTimeRanges.indexOf('medium_term') > -1 ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.addOrRemoveArtistTimeRange('medium_term')}>Medium Term</button>
                <button className="btn default artist-time-range-btn"
                    style={{background: this.state.artistTimeRanges.indexOf('long_term') > -1 ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.addOrRemoveArtistTimeRange('long_term')}>Long Term</button>
            </div>
        )
    }
}

export default FavoriteArtistsCriteria;
