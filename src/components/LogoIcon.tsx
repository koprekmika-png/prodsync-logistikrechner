export default function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#EFEFEF"/>
      <text x="10" y="46" fontFamily="Georgia, serif" fontSize="46" fontWeight="900" fill="#1a1a1a">P</text>
      <circle cx="46" cy="52" r="7" fill="#F97316"/>
    </svg>
  );
}
