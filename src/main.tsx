import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { watchAuth } from './hooks/useAuth'
import { registerPwa, requestPersistentStorage } from './lib/pwa'
import './styles/tokens.css'

registerPwa()
requestPersistentStorage()
watchAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
