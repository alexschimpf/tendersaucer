import 'rc-slider/assets/index.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';

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
                <table>
                    <tbody>
                        <tr>
                            <th>
                                <h3 className="param-header">Artist Popularity</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Release Year</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[1900, 2019]} min={1900} max={2019}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Tempo</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 250]} min={0} max={250}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Danceability</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Adventurousness</h3>
                            </th>
                            <th>
                                <SliderWithTooltip className="slider" defaultValue={3} min={0} max={3}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={{backgroundColor: 'salmon'}}
                                    railStyle={{backgroundColor: 'salmon'}}/>
                            </th>
                        </tr>
                    </tbody>
                </table>

                <h3 className="param-header-outside-table" style={{marginTop: '30px'}}>Artist Time Range</h3>
                <button className="btn default"
                    style={{fontSize: '12px', marginLeft: '-112px', background: this.state.artistTimeRanges.indexOf('short_term') > -1 ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.addOrRemoveArtistTimeRange('short_term')}>Short Term</button>
                <button className="btn default"
                    style={{marginLeft: '10px', fontSize: '12px', background: this.state.artistTimeRanges.indexOf('medium_term') > -1 ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.addOrRemoveArtistTimeRange('medium_term')}>Medium Term</button>
                <button className="btn default"
                    style={{marginLeft: '10px', fontSize: '12px', background: this.state.artistTimeRanges.indexOf('long_term') > -1 ? '#EFEFEF' : '#FFFFFF'}}
                    onClick={() => this.addOrRemoveArtistTimeRange('long_term')}>Long Term</button>
            </div>
        )
    }
}

export default FavoriteArtistsCriteria;
