interface ControlRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  onReset?: () => void;
  canReset?: boolean;
}

export function ControlRow({ label, hint, children, onReset, canReset = false }: ControlRowProps) {
  return (
    <div className="control-row">
      <div className="control-row__header">
        <div className="control-label">
          {label}
          {hint && <small className="control-hint">{hint}</small>}
        </div>
        {onReset && canReset && (
          <button type="button" className="control-reset" onClick={onReset} aria-label={`Reset ${label}`}>
            Reset
          </button>
        )}
      </div>
      <div className="control-input">{children}</div>
    </div>
  );
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

export function Slider({ value, min, max, step = 1, unit = '', onChange }: SliderProps) {
  return (
    <div className="slider-wrap">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="slider-val">
        {value}
        {unit}
      </span>
    </div>
  );
}
