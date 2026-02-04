import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Conflux AI: Boot sequence initiated...");

const initializeApp = () => {
  const rootElement = document.getElementById('root');
  const fallback = document.getElementById('fallback-ui');
  const loadingText = document.getElementById('loading-text');

  if (loadingText) loadingText.innerText = "Synchronizing Modalities...";

  if (!rootElement) {
    const errorMsg = "Critical Failure: Root element not found.";
    console.error(errorMsg);
    const errorLog = document.getElementById('error-log');
    if (errorLog) errorLog.innerText = errorMsg;
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Smooth transition from loading to app
    setTimeout(() => {
      if (fallback) {
        fallback.classList.add('hidden');
        console.log("Conflux AI: System fully operational.");
      }
    }, 1000);
    
  } catch (err) {
    const errorMsg = "Render Pipeline Failed: " + (err as Error).message;
    console.error(errorMsg, err);
    const errorLog = document.getElementById('error-log');
    if (errorLog) errorLog.innerText = errorMsg;
  }
};

// Handle mounting regardless of script load order
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeApp();
} else {
  document.addEventListener('DOMContentLoaded', initializeApp);
}
