import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router'; // Importa nosso roteador
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Provê as rotas para toda a aplicação */}
    <RouterProvider router={router} />
  </React.StrictMode>
);