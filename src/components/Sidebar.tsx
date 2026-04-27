import { useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ControlRow, Slider } from './ControlRow';
import { ColorField } from './ColorField';
import { DEFAULT_CONFIG } from '../types';
import type { JellysplashConfig, ImageItem } from '../types';
import { ImageUploader } from './ImageUploader';
import { PRESETS } from '../presets';

interface SidebarProps {
  config: JellysplashConfig;
  onChange: (patch: Partial<JellysplashConfig>) => void;
  images: ImageItem[];
  onImagesChange: Dispatch<SetStateAction<ImageItem[]>>;
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
  const resetProp = <K extends keyof JellysplashConfig>(key: K) => onChange({ [key]: DEFAULT_CONFIG[key] });
  const canResetProp = <K extends keyof JellysplashConfig>(key: K) => config[key] !== DEFAULT_CONFIG[key];

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
        onChange(sanitizeConfigPatch(parsed));
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
          <button type="button" className="import-btn" disabled>
            Sonarr
          </button>
          <button type="button" className="import-btn" disabled>
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
          <ControlRow
            label="Output size"
            onReset={() => onChange({ outputWidth: DEFAULT_CONFIG.outputWidth, outputHeight: DEFAULT_CONFIG.outputHeight })}
            canReset={
              config.outputWidth !== DEFAULT_CONFIG.outputWidth ||
              config.outputHeight !== DEFAULT_CONFIG.outputHeight
            }
          >
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

          <ControlRow label="Tilt angle" onReset={() => resetProp('tilt')} canReset={canResetProp('tilt')}>
            <Slider
              value={config.tilt}
              min={-45}
              max={45}
              unit="°"
              onChange={(v) => onChange({ tilt: v })}
            />
          </ControlRow>
          <ControlRow
            label="Perspective"
            onReset={() => resetProp('perspective')}
            canReset={canResetProp('perspective')}
          >
            <Slider
              value={config.perspective}
              min={-0.5}
              max={0.5}
              step={0.01}
              unit="°"
              onChange={(v) => onChange({ perspective: v })}
            />
          </ControlRow>

          <ControlRow
            label="Card size"
            hint="Width of each card in px"
            onReset={() => resetProp('cardSize')}
            canReset={canResetProp('cardSize')}
          >
            <Slider
              value={config.cardSize}
              min={50}
              max={600}
              unit="px"
              onChange={(v) => onChange({ cardSize: v })}
            />
          </ControlRow>

          <ControlRow
            label="Card aspect ratio"
            onReset={() => resetProp('aspectRatio')}
            canReset={canResetProp('aspectRatio')}
          >
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

          <ControlRow label="Gap" onReset={() => resetProp('gap')} canReset={canResetProp('gap')}>
            <Slider
              value={config.gap}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => onChange({ gap: v })}
            />
          </ControlRow>

          <ControlRow
            label="Corner radius"
            onReset={() => resetProp('cornerRadius')}
            canReset={canResetProp('cornerRadius')}
          >
            <Slider
              value={config.cornerRadius}
              min={0}
              max={100}
              unit="px"
              onChange={(v) => onChange({ cornerRadius: v })}
            />
          </ControlRow>

          <ControlRow
            label="Row jitter"
            hint="Random x offset per row"
            onReset={() => resetProp('jitter')}
            canReset={canResetProp('jitter')}
          >
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
          <ControlRow
            label="Background colour"
            onReset={() => resetProp('bgColour')}
            canReset={canResetProp('bgColour')}
          >
            <ColorField value={config.bgColour} onChange={(value) => onChange({ bgColour: value })} />
          </ControlRow>

          <ControlRow
            label="Overlay type"
            onReset={() => resetProp('overlayType')}
            canReset={canResetProp('overlayType')}
          >
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
            <ControlRow
              label="Overlay strength"
              onReset={() => resetProp('overlayStrength')}
              canReset={canResetProp('overlayStrength')}
            >
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
            <ControlRow
              label="Tint colour"
              onReset={() => resetProp('overlayColour')}
              canReset={canResetProp('overlayColour')}
            >
              <ColorField
                value={config.overlayColour}
                onChange={(value) => onChange({ overlayColour: value })}
              />
            </ControlRow>
          )}

          <ControlRow
            label="Brightness"
            onReset={() => resetProp('brightness')}
            canReset={canResetProp('brightness')}
          >
            <Slider
              value={config.brightness}
              min={0}
              max={200}
              unit="%"
              onChange={(v) => onChange({ brightness: v })}
            />
          </ControlRow>

          <ControlRow
            label="Saturation"
            onReset={() => resetProp('saturation')}
            canReset={canResetProp('saturation')}
          >
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
          <ControlRow
            label="Seed"
            hint="Same seed = same layout"
            onReset={() => resetProp('seed')}
            canReset={canResetProp('seed')}
          >
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

function sanitizeConfigPatch(input: unknown): Partial<JellysplashConfig> {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid config');
  }

  const raw = input as Record<string, unknown>;
  const patch: Partial<JellysplashConfig> = {};

  if (typeof raw.outputWidth === 'number' && Number.isFinite(raw.outputWidth)) {
    patch.outputWidth = clamp(Math.round(raw.outputWidth), 320, 7680);
  }
  if (typeof raw.outputHeight === 'number' && Number.isFinite(raw.outputHeight)) {
    patch.outputHeight = clamp(Math.round(raw.outputHeight), 320, 4320);
  }
  if (typeof raw.cardSize === 'number' && Number.isFinite(raw.cardSize)) {
    patch.cardSize = clamp(Math.round(raw.cardSize), 50, 600);
  }
  if (typeof raw.tilt === 'number' && Number.isFinite(raw.tilt)) {
    patch.tilt = clamp(raw.tilt, -45, 45);
  }
  if (typeof raw.perspective === 'number' && Number.isFinite(raw.perspective)) {
    patch.perspective = clamp(raw.perspective, -0.5, 0.5);
  }
  if (typeof raw.gap === 'number' && Number.isFinite(raw.gap)) {
    patch.gap = clamp(Math.round(raw.gap), 0, 100);
  }
  if (typeof raw.cornerRadius === 'number' && Number.isFinite(raw.cornerRadius)) {
    patch.cornerRadius = clamp(Math.round(raw.cornerRadius), 0, 100);
  }
  if (typeof raw.jitter === 'number' && Number.isFinite(raw.jitter)) {
    patch.jitter = clamp(Math.round(raw.jitter), 0, 300);
  }
  if (typeof raw.brightness === 'number' && Number.isFinite(raw.brightness)) {
    patch.brightness = clamp(Math.round(raw.brightness), 0, 200);
  }
  if (typeof raw.saturation === 'number' && Number.isFinite(raw.saturation)) {
    patch.saturation = clamp(Math.round(raw.saturation), 0, 200);
  }
  if (typeof raw.overlayStrength === 'number' && Number.isFinite(raw.overlayStrength)) {
    patch.overlayStrength = clamp(Math.round(raw.overlayStrength), 0, 100);
  }
  if (typeof raw.seed === 'number' && Number.isFinite(raw.seed)) {
    patch.seed = clamp(Math.round(raw.seed), 0, 99999);
  }
  if (typeof raw.bgColour === 'string' && isHexColour(raw.bgColour)) {
    patch.bgColour = raw.bgColour;
  }
  if (typeof raw.overlayColour === 'string' && isHexColour(raw.overlayColour)) {
    patch.overlayColour = raw.overlayColour;
  }
  if (
    raw.overlayType === 'none' ||
    raw.overlayType === 'solid' ||
    raw.overlayType === 'gradient' ||
    raw.overlayType === 'vignette'
  ) {
    patch.overlayType = raw.overlayType;
  }
  if (raw.aspectRatio === 'source') {
    patch.aspectRatio = raw.aspectRatio;
  } else if (typeof raw.aspectRatio === 'number' && Number.isFinite(raw.aspectRatio)) {
    patch.aspectRatio = clamp(raw.aspectRatio, 0.25, 4);
  }

  if (Object.keys(patch).length === 0) {
    throw new Error('Invalid config');
  }

  return patch;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isHexColour(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
