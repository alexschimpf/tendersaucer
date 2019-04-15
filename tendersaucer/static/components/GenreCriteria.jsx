import 'rc-slider/assets/index.css';
import InfoIcon from './InfoIcon';
import WindowedSelect from "react-windowed-select";
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';

const Range = createSliderWithTooltip(Slider.Range);
const SliderWithTooltip = createSliderWithTooltip(Slider);

const SELECT_STYLES = {
    container: (styles, state) => ({
        ...styles,
        display: 'inline-block',
        width: '380px',
        minWidth: '230px',
        marginTop: '10px',
        borderColor: 'salmon',
        float: 'left',
        fontFamily: '\'Ubuntu\', sans-serif',
        fontWeight: '400',
        fontSize: '12px'
    }),
    menu: (styles, state) => ({
        ...styles,
        width: '400px'
    }),
    option: (styles, state) => ({
        ...styles,
        backgroundColor: 'white'
    }),
    control: (styles, state) => ({
        ...styles,
        borderColor: 'salmon',
        boxShadow: 'none'
    }),
    dropdownIndicator: (styles, state) => ({
        ...styles,
        color: 'salmon'
    }),
    indicatorSeparator: (styles, state) => ({
        ...styles,
        backgroundColor: 'salmon'
    }),
    clearIndicator: (styles, state) => ({
        ...styles,
        color: 'salmon'
    })
};

class GenreCriteria extends React.Component {

    constructor(props) {
        super(props);

        this.onArtistPopularityChanged = this.onArtistPopularityChanged.bind(this);
        this.onTrackReleaseYearChanged = this.onTrackReleaseYearChanged.bind(this);
        this.onTrackTempoChanged = this.onTrackTempoChanged.bind(this);
        this.onTrackDanceabilityChanged = this.onTrackDanceabilityChanged.bind(this);
        this.onGenresChanged = this.onGenresChanged.bind(this);
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

    onGenresChanged(genres) {
        let selectedGenres = genres.map((genre) => genre.value);
        this.props.onFormChanged('genres', selectedGenres);
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
                                 A higher value means a faster-paced track.
                                 The average track tempo is around 120 BPM." />
                    <Range className="slider" defaultValue={[80, 160]} min={0} max={250}
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
                    <h3 className="param-header">Genres</h3>
                    <WindowedSelect classNamePrefix="react-select" styles={SELECT_STYLES}
                        options={this.props.genres} isMulti="true" placeholder="Enter genre name"
                        menuPlacement="bottom"
                        onChange={this.onGenresChanged} />
                </div>
            </div>
        )
    }
}

export default GenreCriteria;
