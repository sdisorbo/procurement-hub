import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DataProvider } from './lib/DataContext'
import { WatchlistProvider } from './lib/Watchlist'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <WatchlistProvider>
          <App />
        </WatchlistProvider>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
