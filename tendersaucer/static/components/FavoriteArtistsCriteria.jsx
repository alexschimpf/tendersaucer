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
        this.onArtistPopularityChanged = this.onArtistPopularityChanged.bind(this);
        this.onTrackReleaseYearChanged = this.onTrackReleaseYearChanged.bind(this);
        this.onTrackTempoChanged = this.onTrackTempoChanged.bind(this);
        this.onTrackDanceabilityChanged = this.onTrackDanceabilityChanged.bind(this);
        this.onAdventurousnessChanged = this.onAdventurousnessChanged.bind(this);
        this.isTimeRangeSelected = this.isTimeRangeSelected.bind(this);
    }

    onArtistPopularityChanged(rangeValues) {
        this.props.onFormChanged('artistPopularity', rangeValues);
    }

    onTrackReleaseYearChanged(rangeValues) {
        this.props.onFormChanged('trackReleaseYear', rangeValues);
    }

    onTrackTempoChanged(rangeValues) {
        this.props.onFormChanged('trackTempo', rangeValues);
    }

    onTrackDanceabilityChanged(rangeValues) {
        this.props.onFormChanged('trackDanceability', rangeValues);
    }

    onAdventurousnessChanged(value) {
        this.props.onFormChanged('adventurousness', value);
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

        this.props.onFormChanged('artistTimeRanges', newArtistTimeRanges);
    }

    isTimeRangeSelected(timeRange) {
        return this.state.artistTimeRanges.includes(timeRange);
    }

    render() {
        return (
            <div className="criteria-div">
                <ReactTooltip effect="solid" className="tooltip"/>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <h3 className="param-header">Artist Popularity</h3>
                    <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                        handleStyle={{borderColor: 'salmon'}}
                        trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}
                        onChange={this.onArtistPopularityChanged} />
                </div>
                <div className="criteria-row">
                    <h3 className="param-header">Track Release Year</h3>
                    <Range className="slider" defaultValue={[1900, 2019]} min={1900} max={2019}
                        handleStyle={{borderColor: 'salmon'}}
                        trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}
                        onChange={this.onTrackReleaseYearChanged} />
                </div>
                <div className="criteria-row">
                    <h3 className="tempo-param-header">Track Tempo</h3>
                    <InfoIcon className="tempo-info-icon"
                        message="Tempo is measured in beats per minute.
                                 A higher value means a faster-paced track." />
                    <Range className="slider" defaultValue={[0, 250]} min={0} max={250}
                        handleStyle={{borderColor: 'salmon'}}
                        trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}
                        onChange={this.onTrackTempoChanged} />
                </div>
                <div className="criteria-row">
                    <h3 className="param-header">Track Danceability</h3>
                    <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                        handleStyle={{borderColor: 'salmon'}}
                        trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}
                        onChange={this.onTrackDanceabilityChanged} />
                </div>
                <div className="criteria-row">
                    <h3 className="adventurousness-param-header">Adventurousness</h3>
                    <InfoIcon className="adventurousness-info-icon"
                        message="This scale represents how much you want your playlist to
                                 deviate from your favorite artists. 0 means you only want
                                 listen to artists you know. 3 means you're willing to listen
                                 to artists who are more different than your favorite artists." />
                    <SliderWithTooltip className="slider" defaultValue={3} min={0} max={3}
                        handleStyle={{borderColor: 'salmon'}}
                        trackStyle={{backgroundColor: 'salmon'}}
                        railStyle={{backgroundColor: 'salmon'}}
                        onChange={this.onAdventurousnessChanged} />
                </div>
                <div className="criteria-row">
                    <h3 className="artist-time-ranges-param-header">Artist Time Ranges</h3>
                    <InfoIcon className="artist-time-ranges-info-icon"
                        message="This is used to help identify your favorite artists -
                                 whether or not to consider artists you've listened
                                 to in the short term, medium term, and/or long term.
                                 Multiple may be selected." />
                    <button
                        className={"btn default artist-time-range-first-btn " +
                                    (this.isTimeRangeSelected('short_term') ? 'selected-btn' : '')}
                        onClick={() => this.addOrRemoveArtistTimeRange('short_term')}>Short Term</button>
                    <button
                        className={"btn default artist-time-range-btn " +
                                    (this.isTimeRangeSelected('medium_term') ? 'selected-btn' : '')}
                        onClick={() => this.addOrRemoveArtistTimeRange('medium_term')}>Medium Term</button>
                    <button
                        className={"btn default artist-time-range-btn " +
                                    (this.isTimeRangeSelected('long_term') ? 'selected-btn' : '')}
                        onClick={() => this.addOrRemoveArtistTimeRange('long_term')}>Long Term</button>
                </div>
            </div>
        )
    }
}

export default FavoriteArtistsCriteria;
