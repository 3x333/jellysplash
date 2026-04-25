interface ControlRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function ControlRow({ label, hint, children }: ControlRowProps) {
  return (
    <div className="control-row">
      <div className="control-label">
        {label}
        {hint && <small className="control-hint">{hint}</small>}
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
