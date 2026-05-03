import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import Widget from './Widget';
import AthanPopup from './AthanPopup';
import { installLogBridge } from './lib/logBridge';
import './styles/globals.css';

installLogBridge();

// `networkMode: 'always'` is critical for a desktop app: our API server is
// running on localhost, but TanStack Query's default ('online') pauses every
// query/mutation when `navigator.onLine === false` — which Chromium flips the
// moment WiFi drops, even though localhost would still respond. Without this,
// disabling WiFi would silently break theme switches, settings updates, and
// even cold-start data loads, despite the server being healthy.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 60_000,
      retry: 1,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

const mode = new URLSearchParams(window.location.search).get('mode');
const isWidget = mode === 'widget';
const isAthanPopup = mode === 'athan-popup';
const isMainApp = !isWidget && !isAthanPopup;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {isAthanPopup ? <AthanPopup /> : isWidget ? <Widget /> : <App />}
      {isMainApp && <Toaster position="bottom-right" richColors closeButton />}
    </QueryClientProvider>
  </StrictMode>,
);
