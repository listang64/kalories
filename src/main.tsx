import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { watchSession } from './lib/session'
import { registerPwa, requestPersistentStorage } from './lib/pwa'
import './styles/tokens.css'

registerPwa()
requestPersistentStorage()
watchSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
