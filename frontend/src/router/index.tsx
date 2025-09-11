import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import BoardPage from '../pages/BoardPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // O elemento principal (layout)
    children: [
      // As rotas filhas que serão renderizadas dentro do <Outlet>
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: '/board/:boardId',
            element: <BoardPage />,
          },
        ],
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
]);