import { createHashRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { ListsPage } from './features/lists/ListsPage';
import { NewListPage } from './features/new/NewListPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ListDetailPage } from './features/lists/ListDetailPage';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ListsPage />,
      },
      {
        path: 'new',
        element: <NewListPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'list/:id',
        element: <ListDetailPage />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}