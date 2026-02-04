import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Conflux AI: Core synchronization started.");

const container = document.getElementById('root');
const loader = document.getElementById('fallback-ui');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Smooth entry
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.classList.add('hidden');
          console.log("Conflux AI: Neural Core Active.");
        }, 500);
      }
    }, 800);
  });
} else {
  console.error("Conflux AI: Root container not found.");
}
