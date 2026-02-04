import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Conflux AI: Core initialization sequence starting...");

const mount = () => {
  const container = document.getElementById('root');
  const loader = document.getElementById('fallback-ui');
  
  if (!container) {
    console.error("Conflux AI: Root node 'root' missing from DOM.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Hide loader once React has started rendering
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.classList.add('hidden');
            console.log("Conflux AI: System fully operational.");
          }, 500);
        }
      }, 1000);
    });
  } catch (err: any) {
    console.error("Conflux AI: Render pipeline failure:", err);
    const errorLog = document.getElementById('error-log');
    if (errorLog) {
      errorLog.innerHTML += `<div>Mount Failed: ${err.message}</div>`;
    }
  }
};

// Initial mount call
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mount();
} else {
  document.addEventListener('DOMContentLoaded', mount);
}
