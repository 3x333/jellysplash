import './App.css';
import Sidebar from './components/Sidebar';
import { useState, useCallback, useRef, useEffect } from 'react';
import { DEFAULT_CONFIG } from './types';
import type { JellysplashConfig, ImageItem } from './types';
import { PreviewCanvas } from './components/PreviewCanvas';
import { PRESETS } from './presets';

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

  const [config, setConfig] = useState<JellysplashConfig>(getDefaultAppConfig());
  const patchConfig = useCallback((patch: Partial<JellysplashConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleRandomise = useCallback(() => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const overlayTypes: JellysplashConfig['overlayType'][] = [
      'none',
      'vignette',
      'gradient',
      'solid',
    ];
    const aspectRatios: (number | 'source')[] = ['source', 0.667, 1.5, 1.333, 1.778, 1];
    const nextPatch: Partial<JellysplashConfig> = {
      tilt: rand(-35, 35),
      cardSize: rand(150, 450),
      gap: rand(0, 30),
      cornerRadius: rand(0, 40),
      jitter: rand(0, 200),
      brightness: rand(70, 120),
      saturation: rand(70, 150),
      overlayType: overlayTypes[rand(0, overlayTypes.length - 1)],
      overlayStrength: rand(20, 80),
      aspectRatio: aspectRatios[rand(0, aspectRatios.length - 1)],
      seed: rand(0, 99999),
    };
    patchConfig(nextPatch);
  }, [patchConfig]);

  const handleResetAll = useCallback(() => {
    setConfig(getDefaultAppConfig());
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
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            Export
          </button>
        </div>
      </header>
      <Sidebar
        config={config}
        onChange={patchConfig}
        images={images}
        onImagesChange={setImages}
        onRandomise={handleRandomise}
        onResetAll={handleResetAll}
      />
      <main className="app-canvas">
        <PreviewCanvas images={images} config={config} onExportReady={handleExportReady} />
      </main>
    </div>
  );
}

export default App;

function getDefaultAppConfig(): JellysplashConfig {
  const defaultPreset = PRESETS.find((preset) => preset.name === 'Default');
  return { ...DEFAULT_CONFIG, ...defaultPreset?.config };
}
