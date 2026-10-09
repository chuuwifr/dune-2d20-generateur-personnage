import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <div data-dune-loaded="true">
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </div>
  );
  (window as unknown as { __DUNE_LOADED__?: boolean }).__DUNE_LOADED__ = true;
}
