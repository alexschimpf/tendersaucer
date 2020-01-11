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

class GenreCriteria extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedGenres: []
        };

        this.onArtistPopularityChanged = this.onArtistPopularityChanged.bind(this);
        this.onTrackReleaseYearChanged = this.onTrackReleaseYearChanged.bind(this);
        this.onTrackTempoChanged = this.onTrackTempoChanged.bind(this);
        this.onTrackDanceabilityChanged = this.onTrackDanceabilityChanged.bind(this);
        this.onGenresChanged = this.onGenresChanged.bind(this);
        this.searchGenres = this.searchGenres.bind(this);
        this.addFavoriteGenres = this.addFavoriteGenres.bind(this);
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

    onGenresChanged(genres) {
        this.setState({selectedGenres: genres});

        let selectedGenres = genres.map(genre => genre.value);
        this.props.onFormChanged('genres', selectedGenres);
    }

    searchGenres(query, callback) {
        axios.get('/search/genres?query=' + query).then(response => {
            let options = response.data.genres.map(genre => {
                return {
                    label: genre.charAt(0).toUpperCase() + genre.slice(1),
                    value: genre
                };
            });
            callback(options);
        }).catch(error => {
            callback([]);
        });
    }

    addFavoriteGenres() {
        this.showLoadingPopup();

        let selectedGenres = this.state.selectedGenres.slice();
        axios.get('/user_top_genres').then(response => {
            let genres = response.data.top_genres;
            genres = genres.map(genre => {
                return {
                    label: genre.charAt(0).toUpperCase() + genre.slice(1),
                    value: genre
                }
            });
            genres.forEach(genre => {
                for (let selectedGenre of selectedGenres) {
                    if (selectedGenre.value === genre.value) {
                        return;
                    }
                }
                selectedGenres.push(genre);
            });
            this.onGenresChanged(selectedGenres);
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
                    <h3 className="param-header">Genres</h3>
                    <AsyncSelect classNamePrefix="react-select" styles={SELECT_STYLES}
                        loadOptions={this.searchGenres} isMulti="true" placeholder="Enter genre name"
                        menuPlacement="bottom"
                        onChange={this.onGenresChanged} value={this.state.selectedGenres} />
                    <button className="btn default genre-add-favorites-btn"
                        onClick={this.addFavoriteGenres}>Add Favorites</button>
                </div>
            </div>
        )
    }
}

export default GenreCriteria;
