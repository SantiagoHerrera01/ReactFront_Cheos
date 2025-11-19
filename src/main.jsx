import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { AlertProvider } from './context/AlertContext'; // ⬅️ Importa tu nuevo provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlertProvider>
      <App />
    </AlertProvider>
  </React.StrictMode>
);
