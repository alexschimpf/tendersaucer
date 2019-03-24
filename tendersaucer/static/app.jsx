import 'app.css';
import 'index.html';

import React from 'react';
import ReactDOM from "react-dom";


if (window.location.hash) {
    window.location = window.location.href.split('#')[0];
}