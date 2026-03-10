import type { ReactNode, CSSProperties } from 'react';

export default function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 14,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  );
}
