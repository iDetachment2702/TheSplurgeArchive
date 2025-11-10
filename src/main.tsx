import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient } from '@tanstack/query-core';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/react/utils';
import { queryClientAtom } from 'jotai-tanstack-query';
import { App } from './App';
import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 10, // 10分
    },
  },
});

const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider>
      <HydrateAtoms>
        <App />
      </HydrateAtoms>
    </Provider>
  </React.StrictMode>
);
