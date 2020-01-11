import 'rc-slider/assets/index.css';
import axios from 'axios';
import InfoIcon from './InfoIcon';
import AsyncSelect from 'react-select/lib/Async';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import ReactTooltip from 'react-tooltip';
import Loader from 'react-loader-spinner';
import Popup from 'react-popup';


const Range = createSliderWithTooltip(Slider.Range);
const SliderWithTooltip = createSliderWithTooltip(Slider);

const SELECT_STYLES = {
    container: (styles, state) => ({
        ...styles,
        display: 'inline-block',
        width: '415px',
        minWidth: '230px',
        marginTop: '10px',
        borderColor: 'salmon',
        float: 'left',
        fontFamily: '\'Ubuntu\', sans-serif',
        fontWeight: '800',
        fontSize: '14px'
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

class ArtistsCriteria extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedArtists: []
        };

        this.onArtistPopularityChanged = this.onArtistPopularityChanged.bind(this);
        this.onTrackReleaseYearChanged = this.onTrackReleaseYearChanged.bind(this);
        this.onTrackTempoChanged = this.onTrackTempoChanged.bind(this);
        this.onTrackDanceabilityChanged = this.onTrackDanceabilityChanged.bind(this);
        this.onAdventurousnessChanged = this.onAdventurousnessChanged.bind(this);
        this.isTimeRangeSelected = this.isTimeRangeSelected.bind(this);
        this.searchArtists = this.searchArtists.bind(this);
        this.onArtistsChanged = this.onArtistsChanged.bind(this);
        this.addFavoriteArtists = this.addFavoriteArtists.bind(this);
        this.showLoadingPopup = this.showLoadingPopup.bind(this);
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

    isTimeRangeSelected(timeRange) {
        return this.state.artistTimeRanges.includes(timeRange);
    }

    onArtistsChanged(artists) {
        this.setState({selectedArtists: artists});

        let selectedArtists = artists.map(artist => artist.value);
        this.props.onFormChanged('artists', selectedArtists);
    }

    searchArtists(query, callback) {
        axios.get('/search/artists?query=' + query).then(response => {
            let options = response.data.artists.map(artist => {
                return {
                    label: artist.name,
                    value: artist.id
                };
            });
            callback(options);
        }).catch(error => {
            callback([]);
        });
    }

    addFavoriteArtists() {
        this.showLoadingPopup();

        let selectedArtists = this.state.selectedArtists.slice();
        axios.get('/user_top_artists?time_range=medium').then(response => {
            let artists = response.data.top_artists;
            artists = artists.map(artist => {
                return {
                    label: artist.name,
                    value: artist.id,
                }
            });
            artists.forEach(artist => {
                for (let selectedArtist of selectedArtists) {
                    if (selectedArtist.value === artist.value) {
                        return;
                    }
                }
                selectedArtists.push(artist);
            });
            this.onArtistsChanged(selectedArtists);
        }).finally(() => {
            Popup.close();
        });
    }

    showLoadingPopup() {
        Popup.create({
            title: 'Loading',
            content: (
                <div className="loader-div">
                    <h3>Hang tight. This could take a minute.</h3>
                    <div>
                        <Loader type="Oval" color="orange" height="50" width="50" />
                    </div>
                </div>
            )
        });
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
                    <h3 className="adventurousness-param-header">Adventurousness</h3>
                    <InfoIcon className="adventurousness-info-icon"
                        message="This scale represents how much you want your playlist to
                                 deviate from your favorite artists. 0 means you only want to
                                 listen to artists you know. 3 means you're willing to listen
                                 to artists who are quite different than your favorite artists." />
                    <SliderWithTooltip className="slider" defaultValue={0} min={0} max={3}
                        handleStyle={{borderColor: 'salmon'}}
                        trackStyle={{backgroundColor: 'salmon'}}
                        railStyle={{backgroundColor: 'salmon'}}
                        onChange={this.onAdventurousnessChanged} />
                </div>
                <div className="criteria-row">
                    <h3 className="param-header">Artists</h3>
                    <AsyncSelect classNamePrefix="react-select" styles={SELECT_STYLES}
                        loadOptions={this.searchArtists} isMulti="true" placeholder="Enter artist name"
                        menuPlacement="bottom"
                        onChange={this.onArtistsChanged} value={this.state.selectedArtists} />
                    <button className="btn default genre-add-favorites-btn"
                        onClick={this.addFavoriteArtists}>Add Favorites</button>
                </div>
            </div>
        )
    }
}

export default ArtistsCriteria;
