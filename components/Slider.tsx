import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  Icon?: React.ElementType;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step = 1, unit, Icon }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const bgStyle = {
    background: `linear-gradient(to right, #0ea5e9 ${percentage}%, #334155 ${percentage}%)`,
  };

  return (
    <div>
      <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2">
        <span className="flex items-center">
          {Icon && <Icon className="w-5 h-5 mr-2 text-sky-400" />}
          {label}
        </span>
        <span className="font-semibold bg-slate-700 px-2 py-0.5 rounded-md text-sky-300 text-xs">{value.toFixed(0)}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={bgStyle}
      />
    </div>
  );
};

export default Slider;