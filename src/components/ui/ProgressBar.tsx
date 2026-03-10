export default function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3,
          flex: 1,
          borderRadius: 99,
          background: i < step ? '#F97316' : '#E5E7EB',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}
