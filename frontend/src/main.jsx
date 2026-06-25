import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AudioProvider } from './context/AudioContext'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AudioProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AudioProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
