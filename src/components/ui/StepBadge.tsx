const ORANGE = '#F97316';

interface StepBadgeProps {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}

export default function StepBadge({ n, label, active, done }: StepBadgeProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: done || active ? ORANGE : '#F3F4F6',
        color: done || active ? 'white' : '#9CA3AF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
      }}>
        {done ? '✓' : n}
      </div>
      <span style={{
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        color: active ? '#111' : done ? '#6B7280' : '#9CA3AF',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </span>
    </div>
  );
}
