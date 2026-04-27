import { useRef } from 'react';
import { ControlRow, Slider } from './ControlRow';
import type { JellysplashConfig, ImageItem } from '../types';
import { ImageUploader } from './ImageUploader';
import { PRESETS } from '../presets';

interface SidebarProps {
  config: JellysplashConfig;
  onChange: (patch: Partial<JellysplashConfig>) => void;
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  onRandomise: () => void;
}

export default function Sidebar({
  config,
  onChange,
  images,
  onImagesChange,
  onRandomise,
}: SidebarProps) {
  const sizeValue = `${config.outputWidth}x${config.outputHeight}`;
  const importRef = useRef<HTMLInputElement>(null);

  const exportConfig = () => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jellysplash-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        onChange(parsed);
      } catch {
        alert('Invalid config file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="app-sidebar">
      <details open>
        <summary>Import Options</summary>
        <div className="section-content">
          <ImageUploader images={images} onChange={onImagesChange} />
          <button type="button" className="import-btn">
            Sonarr
          </button>
          <button type="button" className="import-btn">
            Radarr
          </button>
        </div>
      </details>

      <details open>
        <summary>Config</summary>
        <div className="section-content">
          <button type="button" className="import-btn" onClick={onRandomise}>
            Randomise all settings
          </button>
          <ControlRow label="Load preset">
            <select
              value=""
              onChange={(e) => {
                const preset = PRESETS.find((p) => p.name === e.target.value);
                if (preset) onChange(preset.config);
              }}
            >
              <option value="" disabled>
                Choose a preset…
              </option>
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </ControlRow>
          <button type="button" className="import-btn" onClick={exportConfig}>
            Export config
          </button>
          <button type="button" className="import-btn" onClick={() => importRef.current?.click()}>
            Import config
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importConfig}
          />
        </div>
      </details>

      <details open>
        <summary>Splashscreen Settings</summary>
        <div className="section-content">
          <ControlRow label="Output size">
            <select
              value={sizeValue}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                onChange({ outputWidth: w, outputHeight: h });
              }}
            >
              <option value="1920x1080">1920 × 1080</option>
              <option value="2560x1440">2560 × 1440</option>
              <option value="3840x2160">3840 × 2160</option>
            </select>
          </ControlRow>

          <ControlRow label="Tilt angle">
            <Slider
              value={config.tilt}
              min={-45}
              max={45}
              unit="°"
              onChange={(v) => onChange({ tilt: v })}
            />
          </ControlRow>
          <ControlRow label="Perspective">
            <Slider
              value={config.perspective}
              min={-0.5}
              max={0.5}
              step={0.01}
              unit="°"
              onChange={(v) => onChange({ perspective: v })}
            />
          </ControlRow>

          <ControlRow label="Card size" hint="Width of each card in px">
            <Slider
              value={config.cardSize}
              min={50}
              max={600}
              unit="px"
              onChange={(v) => onChange({ cardSize: v })}
            />
          </ControlRow>

          <ControlRow label="Card aspect ratio">
            <select
              value={String(config.aspectRatio)}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ aspectRatio: v === 'source' ? 'source' : Number(v) });
              }}
            >
              <option value="source">Source (auto)</option>
              <option value="0.667">2:3 — Portrait</option>
              <option value="1.5">3:2 — Landscape</option>
              <option value="1.333">4:3 — Classic</option>
              <option value="1.778">16:9 — Widescreen</option>
              <option value="1">1:1 — Square</option>
            </select>
          </ControlRow>

          <ControlRow label="Gap">
            <Slider
              value={config.gap}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => onChange({ gap: v })}
            />
          </ControlRow>

          <ControlRow label="Corner radius">
            <Slider
              value={config.cornerRadius}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => onChange({ cornerRadius: v })}
            />
          </ControlRow>

          <ControlRow label="Row jitter" hint="Random x offset per row">
            <Slider
              value={config.jitter}
              min={0}
              max={300}
              unit="px"
              onChange={(v) => onChange({ jitter: v })}
            />
          </ControlRow>
        </div>
      </details>

      <details open>
        <summary>Overlay & Background</summary>
        <div className="section-content">
          <ControlRow label="Background colour">
            <input
              type="color"
              value={config.bgColour}
              onChange={(e) => onChange({ bgColour: e.target.value })}
            />
          </ControlRow>

          <ControlRow label="Overlay type">
            <select
              value={config.overlayType}
              onChange={(e) =>
                onChange({ overlayType: e.target.value as JellysplashConfig['overlayType'] })
              }
            >
              <option value="none">None</option>
              <option value="vignette">Vignette</option>
              <option value="gradient">Gradient</option>
              <option value="solid">Solid tint</option>
            </select>
          </ControlRow>

          {config.overlayType !== 'none' && (
            <ControlRow label="Overlay strength">
              <Slider
                value={config.overlayStrength}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => onChange({ overlayStrength: v })}
              />
            </ControlRow>
          )}

          {config.overlayType === 'solid' && (
            <ControlRow label="Tint colour">
              <input
                type="color"
                value={config.overlayColour}
                onChange={(e) => onChange({ overlayColour: e.target.value })}
              />
            </ControlRow>
          )}

          <ControlRow label="Brightness">
            <Slider
              value={config.brightness}
              min={0}
              max={200}
              unit="%"
              onChange={(v) => onChange({ brightness: v })}
            />
          </ControlRow>

          <ControlRow label="Saturation">
            <Slider
              value={config.saturation}
              min={0}
              max={200}
              unit="%"
              onChange={(v) => onChange({ saturation: v })}
            />
          </ControlRow>
        </div>
      </details>

      <details open>
        <summary>Seed</summary>
        <div className="section-content">
          <ControlRow label="Seed" hint="Same seed = same layout">
            <input
              type="number"
              value={config.seed}
              min={0}
              max={99999}
              onChange={(e) => onChange({ seed: Number(e.target.value) })}
              className="seed-input"
            />
          </ControlRow>
        </div>
      </details>
    </aside>
  );
}
