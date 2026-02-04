import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Conflux AI: System boot sequence initiated.");

const mountApp = () => {
  const container = document.getElementById('root');
  const loader = document.getElementById('fallback-ui');
  
  if (!container) {
    console.error("Conflux AI: Root container not found.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Give React a moment to complete the first paint before hiding the loader
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.classList.add('hidden');
            console.log("Conflux AI: Core operational. UI ready.");
          }, 500);
        }
      }, 800);
    });
  } catch (err) {
    console.error("Conflux AI: Initialization failure:", err);
    const log = document.getElementById('error-log');
    if (log) log.innerHTML += `<div>Mount Error: ${err.message}</div>`;
  }
};

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
