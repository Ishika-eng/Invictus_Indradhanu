import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AdvisoryProvider } from './context/AdvisoryContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AdvisoryProvider>
      <App />
    </AdvisoryProvider>
  </React.StrictMode>
);
