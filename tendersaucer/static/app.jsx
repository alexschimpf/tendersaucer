import 'app.css';
import 'index.html';
import 'rc-slider/assets/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Spring } from 'react-spring/renderprops';
import WindowedSelect from "react-windowed-select";
import axios from 'axios';
import Slider, { createSliderWithTooltip } from 'rc-slider';

const Range = createSliderWithTooltip(Slider.Range);
const SliderWithTooltip = createSliderWithTooltip(Slider);


if (window.location.hash) {
    window.location = window.location.href.split('#')[0];
}

const GENRE_OPTIONS = [];
for (let genre of GENRES) {
    GENRE_OPTIONS.push({
        label: genre,
        value: genre
    });
}

function tipFormatter(value) {
    return {
        0: 'Not at all',
        1: 'Kinda',
        2: 'Yeah',
        3: 'Definitely'
    }[value];
}

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    /*
    - Custom genres
        - Genres to include (maybe include 'Add Favorite Genres' button?)
        - Artist popularity range
        - Track danceability range
        - Track tempo range
        - Track release year range
        - Playlist name
    - Favorite artists
        - Short/Medium/Long-term
            - Can choose multiple
        - Genres to include
        - Artist popularity range
        - Track danceability range
        - Track tempo range
        - Track release year range
        - Adventurousness (some other way to frame this?)
        - Playlist name

    genres
    4 ranges

    --

    options
    genres include
    genres exclude
    4 ranges
    Adventurousness
    */
    render() {
        return (
            <div>
                <div style={{
                    backgroundImage: 'linear-gradient(to right, darksalmon, salmon)',
                    margin: '-10px', height: '80px', marginBottom: '60px'}}>
                    <img src="static/tendersaucer.jpg" style={{
                        width: '80px',
                        paddingTop: '10px', float: 'left',
                        marginLeft: '40px'}}></img>
                    <h3 style={{
                        display: 'inline-block', margin: '0', padding: '20px',
                        fontSize: '40px', color: 'white', paddingLeft: '10px'}}>TENDERSAUCER</h3>
                    <h3 style={{
                        display: 'inline-block', fontSize: '20px',
                        color: 'white', float: 'right', paddingTop: '30px',
                        margin: '0', marginRight: '40px'}}>LOGIN</h3>
                </div>
                <div>
                    <table style={{width: '100%'}}>
                        <tbody>
                            <tr>
                                <th style={{
                                    width: '30%', borderRightColor: 'salmon',
                                    borderRightStyle: 'solid', borderRightWidth: '1px'}}>
                                    <h3>PLAYLIST NAME</h3>
                                    <input className="playlist-name" type="text"></input>
                                    <h3>PLAYLIST TYPE</h3>
                                    <button className="btn default" style={{marginTop: '5px'}}>GENRES</button><br></br>
                                    <button className="btn default">FAVORITE ARTISTS</button>
                                </th>
                                <th style={{width: '5%'}}></th>
                                <th style={{width: '50%'}}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <th>
                                                    <h3 className="param-header">ARTIST TIME RANGE</h3>
                                                </th>
                                                <th>
                                                    <input type="checkbox" name="artist-time-range" value="short"></input>
                                                    <label className="checkbox-label" > Short term</label>
                                                    <input style={{marginLeft: '10px'}} type="checkbox" name="artist-time-range" value="medium"></input>
                                                    <label className="checkbox-label" > Medium term</label>
                                                    <input style={{marginLeft: '10px'}} type="checkbox" name="artist-time-range" value="long"></input>
                                                    <label className="checkbox-label" > Long term</label>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>
                                                    <h3 className="param-header">ARTIST POPULARITY</h3>
                                                </th>
                                                <th>
                                                    <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                                        handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                                                </th>
                                            </tr>
                                                <th>
                                                    <h3 className="param-header">TRACK RELEASE YEAR</h3>
                                                </th>
                                                <th>
                                                    <Range className="slider" defaultValue={[1900, 2019]} min={1900} max={2019}
                                                        handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                                                </th>
                                            <tr>
                                                <th>
                                                    <h3 className="param-header">TRACK TEMPO</h3>
                                                </th>
                                                <th>
                                                    <Range className="slider" defaultValue={[0, 250]} min={0} max={250}
                                                        handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>
                                                    <h3 className="param-header">TRACK DANCEABILITY</h3>
                                                </th>
                                                <th>
                                                    <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                                        handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'},{backgroundColor: 'salmon'}]}
                                                        railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>
                                                    <h3 className="param-header">ADVENTUROUSNESS</h3>
                                                </th>
                                                <th>
                                                    <SliderWithTooltip className="slider" defaultValue={3} min={0} max={3}
                                                        handleStyle={{borderColor: 'salmon'}} trackStyle={{backgroundColor: 'salmon'}}
                                                        railStyle={{backgroundColor: 'salmon'}}/>
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </th>
                                <th style={{width: '15%'}}></th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        <Main />
    </div>,
    document.getElementById('root')
);
