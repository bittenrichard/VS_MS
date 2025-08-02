import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './features/auth/context/AuthContext.tsx';

// A LINHA ABAIXO É A QUE PRECISA SER CORRIGIDA
import 'react-phone-input-2/lib/style.css';// Mudei de 'style.css' para 'bootstrap.css'

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  // </React.StrictMode>
);