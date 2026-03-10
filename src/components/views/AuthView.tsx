import { useState } from 'react';
import { supabase } from '../../lib/supabase';

type Mode = 'login' | 'register';

export default function AuthView() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firmenname, setFirmenname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '2px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: 5,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 14,
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { firmenname } },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Bitte bestätige deine Email');
      }
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '36px 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>
            Logistikrechner
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
            by ProdSync
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: '#F3F4F6',
          borderRadius: 10,
          padding: 3,
          marginBottom: 24,
        }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                background: mode === m ? '#FFFFFF' : 'transparent',
                color: mode === m ? '#111' : '#6B7280',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>

        {/* Felder */}
        <div>
          {mode === 'register' && (
            <>
              <label style={labelStyle}>Firmenname</label>
              <input
                type="text"
                value={firmenname}
                onChange={e => setFirmenname(e.target.value)}
                placeholder="z.B. Gerüstbau GmbH"
                style={inputStyle}
              />
            </>
          )}
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@firma.de"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <label style={labelStyle}>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mindestens 6 Zeichen"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Fehler / Erfolg */}
        {error && (
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            fontSize: 13,
            color: '#DC2626',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 8,
            fontSize: 13,
            color: '#16A34A',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '13px 0',
            borderRadius: 10,
            border: 'none',
            background: loading || !email || !password ? '#E5E7EB' : '#F97316',
            color: loading || !email || !password ? '#9CA3AF' : 'white',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            boxShadow: (!loading && email && password) ? '0 4px 14px rgba(249,115,22,0.25)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Bitte warten…' : mode === 'login' ? 'Anmelden' : 'Account erstellen'}
        </button>
      </div>
    </div>
  );
}
