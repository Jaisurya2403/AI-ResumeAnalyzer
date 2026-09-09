import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept third-party extension errors (e.g. reportAllChanges startTime undefined)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event?.message?.includes('startTime') ||
      event?.message?.includes('reportAllChanges') ||
      event?.filename?.includes('extension') ||
      event?.message?.includes('ResizeObserver loop')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event?.reason?.message?.includes('startTime') ||
      event?.reason?.message?.includes('reportAllChanges')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
