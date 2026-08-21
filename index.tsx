import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

console.log("Conflux AI: System handshake initiated...");

const init = () => {
  console.log("Conflux AI: DOM ready, starting render pipeline...");
  const container = document.getElementById('root');

  if (!container) {
    console.error("Conflux AI: Root DOM node missing.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );

    console.log("Conflux AI: React render complete.");
  } catch (err: any) {
    console.error("Conflux AI: Render pipeline crashed:", err);
  }
};

// Handle various loading states
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
