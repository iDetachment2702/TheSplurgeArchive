import React from 'react';
import { createBrowserRouter, RouterProvider, ScrollRestoration, Outlet } from 'react-router-dom';
import { Blog } from './Blog';
import { MonthlyArchive } from './pages/MonthlyArchive';
import { ErrorPage } from './pages/ErrorPage';
import { ErrorBoundary } from './component/ErrorBoundary';

// GitHub Pagesのベースパスを設定（vite.config.tsのbaseと一致させる）
const basename = import.meta.env.BASE_URL;

const Layout = () => {
  return (
    <ErrorBoundary>
      <ScrollRestoration />
      <Outlet />
    </ErrorBoundary>
  );
};

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Blog /> },
        { path: '/article/:slug', element: <Blog /> },
        { path: '/tag/:tag', element: <Blog /> },
        { path: '/archive/:yearMonth', element: <MonthlyArchive /> },
        { path: '/error', element: <ErrorPage /> },
      ],
    },
  ],
  { basename }
);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
