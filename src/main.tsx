import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App.tsx';
import Congratulations from '@/pages/congratulations.tsx';
import ErrorPage from '@/pages/ErrorPage.tsx';

// document.documentElement.classList.add('dark');

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/confirmation" element={<Congratulations />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
        <Toaster />
        <ReactQueryDevtools />
      </BrowserRouter>
    </StrictMode>
  </QueryClientProvider>
);
