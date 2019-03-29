import './css/app.css';
import './html/index.html';
import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main.jsx';


if (window.location.hash) {
    window.location = window.location.href.split('#')[0];
}

ReactDOM.render(
    <div>
        <Main />
    </div>,
    document.getElementById('root')
);
