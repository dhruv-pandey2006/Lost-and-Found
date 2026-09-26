import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

/* Design System CSS - order matters */
import './styles/variables.css';
import './styles/reset.css';
import './styles/components.css';
import './styles/layout.css';

/* Seed demo data on first load */
import { seedDatabase } from './utils/seedData.js';
seedDatabase();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
