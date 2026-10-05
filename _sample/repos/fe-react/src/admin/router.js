import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Reports from './Reports';
export const adminRouter = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'reports', element: <Reports /> },
      { path: 'settings', lazy: () => import('./Settings') },
    ],
  },
]);
