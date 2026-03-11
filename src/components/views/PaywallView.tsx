import { supabase } from '../../lib/supabase';

const handleCheckout = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      email: user.email,
      priceId: 'price_1T9sbIE2Uw5NPkXyQGtf1jsK',
    }),
  });
  const { url } = await response.json();
  if (url) window.location.href = url;
};

const FEATURES = [
  'Unbegrenzte Berechnungen',
  'Fuhrparkverwaltung',
  'Berechnungshistorie',
  'PDF Export (demnächst)',
];

export default function PaywallView() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>

        {/* Icon + Titel */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', margin: 0 }}>
            Dein Trial ist abgelaufen
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 10 }}>
            Starte jetzt dein Abo für vollen Zugriff auf den Logistikrechner
          </p>
        </div>

        {/* Preis-Card */}
        <div style={{
          background: 'white',
          border: '2px solid #F97316',
          borderRadius: 16,
          padding: '32px 28px',
          marginBottom: 16,
          boxShadow: '0 4px 24px rgba(249,115,22,0.08)',
        }}>
          {/* Preis */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#111', fontFamily: "'DM Mono', monospace" }}>
              149,99 €
            </div>
            <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
              / Monat
            </div>
          </div>

          {/* Feature-Liste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#F97316', fontWeight: 700, fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 14, color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              padding: '14px 0',
              background: '#F97316',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EA580C')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F97316')}
          >
            Jetzt abonnieren
          </button>
        </div>

        {/* Trust-Text */}
        <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
          Sicher bezahlen mit Stripe · Jederzeit kündbar
        </div>

      </div>
    </div>
  );
}
