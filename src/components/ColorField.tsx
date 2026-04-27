import { useEffect, useId, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  swatches?: string[];
}

export function ColorField({ value, onChange, swatches = DEFAULT_SWATCHES }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value.toUpperCase());
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    setDraft(value.toUpperCase());
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const applyDraft = () => {
    const normalized = normalizeHex(draft);
    if (normalized) {
      onChange(normalized);
      setDraft(normalized.toUpperCase());
    } else {
      setDraft(value.toUpperCase());
    }
  };

  return (
    <div ref={rootRef} className="color-field">
      <button
        type="button"
        className="color-field__button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="color-field__swatch" style={{ backgroundColor: value }} />
        <span className="color-field__value">{value.toUpperCase()}</span>
      </button>
      {open && (
        <div className="color-field__popover" role="dialog" aria-label="Color picker">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="color-field__controls">
            <label className="color-field__label" htmlFor={inputId}>
              Hex
            </label>
            <input
              id={inputId}
              className="color-field__input"
              value={draft}
              spellCheck={false}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={applyDraft}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyDraft();
                  setOpen(false);
                }
              }}
            />
          </div>
          <div className="color-field__swatches">
            {swatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className="color-field__chip"
                style={{ backgroundColor: swatch }}
                onClick={() => onChange(swatch)}
                aria-label={`Select ${swatch}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`;
  }

  return null;
}

const DEFAULT_SWATCHES = [
  '#000000',
  '#111827',
  '#374151',
  '#6b7280',
  '#d1d5db',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];
