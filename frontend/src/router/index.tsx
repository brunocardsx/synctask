import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import BoardPage from '../pages/BoardPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'board/:boardId',
        element: <BoardPage />,
      },
    ],
  },
]);

console.log('Router created:', router);