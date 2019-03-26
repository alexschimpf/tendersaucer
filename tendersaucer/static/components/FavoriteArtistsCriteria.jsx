import 'rc-slider/assets/index.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';

const Range = createSliderWithTooltip(Slider.Range);
const SliderWithTooltip = createSliderWithTooltip(Slider);


class FavoriteArtistsCriteria extends React.Component {
    render() {
        return (
            <table>
                <tbody>
                    <tr>
                        <th>
                            <h3 className="param-header">ARTIST TIME RANGE</h3>
                        </th>
                        <th>
                            <button className="btn default" style={{fontSize: '12px'}}>SHORT TERM</button>
                            <button className="btn default" style={{marginLeft: '10px', fontSize: '12px'}}>MEDIUM TERM</button>
                            <button className="btn default" style={{marginLeft: '10px', fontSize: '12px'}}>LONG TERM</button>
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
        )
    }
}

export default FavoriteArtistsCriteria;
