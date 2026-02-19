import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AlertProvider } from './context/AlertContext'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlertProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AlertProvider>
  </React.StrictMode>
)
