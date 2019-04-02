import './css/app.css';
import './html/index.html';
import 'popup.css';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import Popup from 'react-popup';
import Loader from 'react-loader-spinner'
import Main from './components/Main.jsx';


if (window.location.hash) {
    window.location = window.location.href.split('#')[0];
}

ReactDOM.render(
    <div>
        <Main />
        <Popup />
    </div>,
    document.getElementById('root')
);
