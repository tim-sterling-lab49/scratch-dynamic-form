import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import "@cloudscape-design/global-styles/index.css"
import {applyDensity, applyMode, Density, Mode} from "@cloudscape-design/global-styles";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
applyMode(Mode.Dark);
applyDensity(Density.Compact);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

