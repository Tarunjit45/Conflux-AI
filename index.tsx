import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Conflux AI: System handshake initiated...");

const init = () => {
  console.log("Conflux AI: DOM ready, starting render pipeline...");
  const container = document.getElementById('root');
  const loader = document.getElementById('fallback-ui');

  if (!container) {
    console.error("Conflux AI: Root DOM node missing.");
    const log = document.getElementById('error-log');
    if (log) log.innerHTML += `<div>[FATAL] Root node '#root' not found in DOM.</div>`;
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log("Conflux AI: React render triggered.");

    // Hide loader once the first paint is likely complete
    setTimeout(() => {
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.classList.add('hidden');
          console.log("Conflux AI: Neural interface online.");
        }, 500);
      }
    }, 1200);
  } catch (err: any) {
    console.error("Conflux AI: Render pipeline crashed:", err);
    const log = document.getElementById('error-log');
    if (log) log.innerHTML += `<div style="color:#ef4444;">[RENDER_CRASH] ${err.message || 'Unknown error during React initialization'}</div>`;
  }
};

// Handle various loading states
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
