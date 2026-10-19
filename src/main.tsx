import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { watchInstall } from './lib/install'
import { takeRecipeLink } from './lib/recipeShares'
import { watchSession } from './lib/session'
import { registerPwa, requestPersistentStorage } from './lib/pwa'
import { useAppStore } from './store/appStore'
import './styles/tokens.css'

registerPwa()
requestPersistentStorage()
watchSession()
watchInstall()
useAppStore.setState({ recipeCode: takeRecipeLink() })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
