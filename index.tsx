import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // This points to your App.tsx
import './index.css';   // This will hold your Tailwind styles

const container = document.getElementById('root');

if (!container) {
  throw new Error("Root element not found. Make sure index.html has <div id='root'></div>");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
