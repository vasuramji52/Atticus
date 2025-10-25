import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Prompt from './pages/prompt.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Prompt />
  </StrictMode>,
)
