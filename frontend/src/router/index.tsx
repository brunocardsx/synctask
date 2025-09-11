import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // O elemento principal (nosso layout)
    children: [
      // As rotas filhas que serão renderizadas dentro do <Outlet>
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      // Futuramente: { path: '/board/:boardId', element: <BoardPage /> }
    ],
  },
]);