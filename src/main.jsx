import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './style/theme.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
