import './App.css';
import Sidebar from './components/Sidebar';
import { useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_CONFIG } from './types';
import type { JellysplashConfig, ImageItem } from './types';
import { PreviewCanvas } from './components/PreviewCanvas';

function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const exportFnRef = useRef<() => void>(() => {});
  const handleExportReady = useCallback((fn: () => void) => {
    exportFnRef.current = fn;
  }, []);

  const handleExport = useCallback(() => {
    if (images.length === 0) {
      alert('Please load some images before exporting.');
      return;
    }
    exportFnRef.current();
  }, [images.length]);

  const [config, setConfig] = useState<JellysplashConfig>(DEFAULT_CONFIG);
  const patchConfig = useCallback((patch: Partial<JellysplashConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <span>Jellysplash</span>
        <div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {' '}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" className="btn btn-ghost">
            Randomise
          </button>
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            Export
          </button>
        </div>
      </header>
      <Sidebar config={config} onChange={patchConfig} images={images} onImagesChange={setImages} />
      <main className="app-canvas">
        <PreviewCanvas images={images} config={config} onExportReady={handleExportReady} />
      </main>
    </div>
  );
}

export default App;
