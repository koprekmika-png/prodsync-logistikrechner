import { useState } from 'react';

interface NumInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
}

export default function NumInput({ label, value, onChange, suffix, hint }: NumInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 5px', fontFamily: "'DM Sans', sans-serif" }}>{hint}</p>}
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          value={value}
          min={0}
          step={0.1}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '11px 40px 11px 14px',
            border: `2px solid ${focused ? '#F97316' : '#E5E7EB'}`,
            borderRadius: 10,
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF', fontFamily: "'DM Mono', monospace" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
