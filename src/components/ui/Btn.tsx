import type { ReactNode } from 'react';

const ORANGE = '#F97316';
const ORANGE_DARK = '#EA580C';

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
}

export default function Btn({ children, onClick, disabled, outline, small }: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={e => { if (!disabled && !outline) (e.target as HTMLButtonElement).style.background = ORANGE_DARK; }}
      onMouseLeave={e => { if (!disabled && !outline) (e.target as HTMLButtonElement).style.background = ORANGE; }}
      style={{
        padding: small ? '8px 16px' : '13px 24px',
        borderRadius: 10,
        border: outline ? `2px solid ${ORANGE}` : 'none',
        background: outline ? 'white' : disabled ? '#E5E7EB' : ORANGE,
        color: outline ? ORANGE : disabled ? '#9CA3AF' : 'white',
        fontSize: small ? 13 : 14,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: (!outline && !disabled) ? '0 4px 14px rgba(249,115,22,0.25)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
