import 'rc-slider/assets/index.css';
import WindowedSelect from "react-windowed-select";
import Slider, { createSliderWithTooltip } from 'rc-slider';

const Range = createSliderWithTooltip(Slider.Range);
const SliderWithTooltip = createSliderWithTooltip(Slider);

const SELECT_STYLES = {
    container: (styles, state) => ({
        ...styles,
        display: 'inline-block',
        width: '400px',
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
        backgroundColor: 'white',
        border: '1px dotted salmon'
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
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'}, {backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                            <th>
                                <h3 className="param-header">Track Release Year</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[1900, 2019]} min={1900} max={2019}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'}, {backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Tempo</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 250]} min={0} max={250}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'}, {backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <h3 className="param-header">Track Danceability</h3>
                            </th>
                            <th>
                                <Range className="slider" defaultValue={[0, 100]} min={0} max={100}
                                    handleStyle={{borderColor: 'salmon'}} trackStyle={[{backgroundColor: 'salmon'}, {backgroundColor: 'salmon'}]}
                                    railStyle={{backgroundColor: 'salmon'}} allowCross={false}/>
                            </th>
                        </tr>
                    </tbody>
                </table>

                <h3 className="param-header-outside-table" style={{marginRight: '113px'}}>Genres</h3>
                <WindowedSelect classNamePrefix="react-select" styles={SELECT_STYLES}
                    options={this.props.genres} isMulti="true" placeholder="ENTER GENRE NAME"
                    menuPlacement="bottom"/>
            </div>
        )
    }
}

export default GenreCriteria;
