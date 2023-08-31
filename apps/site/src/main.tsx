import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootRoute, Route, Router, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ChatLayout } from './chat/ChatLayout.tsx';
import './index.css';
import Login from './login/Login.tsx';

const appRoute = new RootRoute({
  component: App,
});

const chatRoute = new Route({
  getParentRoute: () => appRoute,
  component: ChatLayout,
  path: '/chat',
});

const loginRoute = new Route({
  getParentRoute: () => appRoute,
  component: Login,
  path: '/',
});

const routeTree = appRoute.addChildren([chatRoute, loginRoute]);

const router = new Router({ routeTree });

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
