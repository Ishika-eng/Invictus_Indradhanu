import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AdvisoryProvider } from './context/AdvisoryContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AdvisoryProvider>
        <App />
      </AdvisoryProvider>
    </AuthProvider>
  </React.StrictMode>
);
