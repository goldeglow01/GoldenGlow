import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import './styles/base.css';
// site.css is the complete GoldenGlow design system (recovered from the
// production deployment): tokens, base layout, header, hero, sections,
// forms, admin and responsive rules.
import './styles/site.css';
import './styles/hero-main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
