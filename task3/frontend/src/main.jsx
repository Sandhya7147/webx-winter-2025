import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'

const rootElement = document.getElementById('root')

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
