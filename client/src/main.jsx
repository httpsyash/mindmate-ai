import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          icon: '✨',
          style: {
            background: '#f0fdfa',
            color: '#0f172a',
            border: '1px solid #2dd4bf',
          },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
