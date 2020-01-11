import axios from 'axios';
import {default as Menu} from 'reactjs-popup';


class TopBar extends React.Component {

    constructor(props) {
        super(props);

        this.logout = this.logout.bind(this);
    }

    logout() {
        axios.get('/logout').then(response => {
            location.reload();
        });
    }

    render() {
        return (
            <div className="top-bar-div">
                <img src="static/images/tendersaucer.jpg" className="top-bar-logo"></img>
                <h3 className="top-bar-title">Tendersaucer</h3>
                {
                    IS_LOGGED_IN &&
                        <Menu
                            trigger={<img src="static/images/caret-down.png" className="top-bar-btn account-menu-top-bar-btn"></img>}
                            position="bottom center" on="click" mouseLeaveDelay={300} mouseEnterDelay={0}
                            contentStyle={{ padding: '0px', border: 'none', width: '160px' }} arrow={false} closeOnDocumentClick>
                            <div className="account-menu">
                                <button className="account-menu-btn" onClick={this.logout}>Logout</button>
                            </div>
                        </Menu>
                }
                {
                    !IS_LOGGED_IN &&
                        <button className="top-bar-btn login-btn" onClick={() => location.href = '/get_spotify_auth'}>Login</button>
                }
            </div>
        )
    }
}

export default TopBar;
