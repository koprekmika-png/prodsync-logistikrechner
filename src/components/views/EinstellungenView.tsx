import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface EinstellungenViewProps {
  subscriptionStatus?: 'trial' | 'active' | 'expired' | 'cancelled';
  trialDaysLeft?: number;
  onAvatarChange?: (url: string) => void;
}

export default function EinstellungenView({ subscriptionStatus, trialDaysLeft, onAvatarChange }: EinstellungenViewProps) {
  const [name, setName] = useState('');
  const [firmenname, setFirmenname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [trialStart, setTrialStart] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? '');
      supabase.from('profiles')
        .select('name, firmenname, avatar_url, trial_start')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.name) setName(data.name);
          if (data?.firmenname) setFirmenname(data.firmenname);
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
          if (data?.trial_start) setTrialStart(data.trial_start);
        });
    });
  }, []);

  const trialEnd = trialStart ? new Date(new Date(trialStart).getTime() + 7 * 24 * 60 * 60 * 1000) : null;
  const now = new Date();
  const msLeft = trialEnd ? Math.max(0, trialEnd.getTime() - now.getTime()) : 0;
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const daysLeftExact = Math.floor(hoursLeft / 24);
  const hoursLeftRemainder = hoursLeft % 24;
  const trialProgressPercent = trialStart
    ? Math.min(100, ((now.getTime() - new Date(trialStart).getTime()) / (7 * 24 * 60 * 60 * 1000)) * 100)
    : 0;

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ name, firmenname }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Datei zu groß (max. 2 MB)'); return; }

    setAvatarUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload fehlgeschlagen: ' + uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    setAvatarUrl(publicUrl);
    onAvatarChange?.(publicUrl);
    setAvatarUploading(false);
  };

  const handleCancelTrial = async () => {
    if (!window.confirm('Möchtest du deine Gratis-Testphase wirklich beenden? Dein Zugang wird sofort gesperrt.')) return;
    setCancelLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', user.id);
      window.location.reload();
    } catch (err: any) {
      alert('Fehler: ' + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
    } catch (err: any) {
      alert('Fehler: ' + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const badge = (() => {
    if (subscriptionStatus === 'active') return { label: 'Aktiv', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' };
    if (subscriptionStatus === 'trial') return { label: `Trial – noch ${trialDaysLeft} Tag${trialDaysLeft !== 1 ? 'e' : ''}`, color: '#EA580C', bg: '#FFF7ED', border: '#F97316' };
    return { label: 'Abgelaufen', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
  })();

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #E5E7EB', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", color: '#111',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 560, fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 8, marginTop: 0 }}>Einstellungen</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 40, marginTop: 0 }}>Profil und Abonnement verwalten</p>

      {/* Profil */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 24px 0' }}>Profil</h2>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            onClick={() => !avatarUploading && fileInputRef.current?.click()}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#FFF7ED', border: '2px solid #F97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: avatarUploading ? 'not-allowed' : 'pointer',
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            {avatarUploading ? (
              <span style={{ fontSize: 20 }}>⏳</span>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Profilbild" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 32 }}>👷</span>
            )}
          </div>
          <div>
            <button
              onClick={() => !avatarUploading && fileInputRef.current?.click()}
              disabled={avatarUploading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E5E7EB',
                background: 'white', color: '#374151', fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: avatarUploading ? 'not-allowed' : 'pointer',
              }}
            >
              {avatarUploading ? 'Wird hochgeladen...' : 'Bild ändern'}
            </button>
            <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#9CA3AF' }}>JPG, PNG oder GIF · Max. 2 MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>

        {/* Firmenname */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Firmenname</label>
          <input value={firmenname} onChange={e => setFirmenname(e.target.value)} style={inputStyle} />
        </div>

        {/* E-Mail (readonly) */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>E-Mail</label>
          <input
            value={email} readOnly
            style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: saved ? '#16A34A' : '#F97316', color: 'white',
            fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Gespeichert' : saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>

      {/* Abonnement */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 20px 0' }}>Abonnement</h2>

        {/* Status Badge */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Aktueller Status</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: badge.bg, border: `1px solid ${badge.border}`,
            borderRadius: 20, padding: '5px 14px',
            fontSize: 13, fontWeight: 700, color: badge.color,
          }}>
            {badge.label}
          </div>
        </div>

        {/* Trial Countdown */}
        {subscriptionStatus === 'trial' && trialEnd && (
          <div style={{
            background: '#FFF7ED', border: '1px solid #FED7AA',
            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#EA580C', marginBottom: 4 }}>
                  Gratis-Testphase
                </div>
                <div style={{ fontSize: 12, color: '#9A3412' }}>
                  Läuft ab am {trialEnd.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#EA580C', lineHeight: 1 }}>
                  {daysLeftExact}
                </div>
                <div style={{ fontSize: 11, color: '#9A3412', marginTop: 2 }}>
                  {daysLeftExact === 1 ? 'Tag' : 'Tage'} verbleibend
                </div>
              </div>
            </div>

            {/* Fortschrittsbalken */}
            <div style={{ background: '#FED7AA', borderRadius: 100, height: 6, marginBottom: 8 }}>
              <div style={{
                background: '#F97316', borderRadius: 100, height: '100%',
                width: `${trialProgressPercent}%`,
              }} />
            </div>

            <div style={{ fontSize: 11, color: '#9A3412' }}>
              {daysLeftExact > 0
                ? `Noch ${daysLeftExact} Tag${daysLeftExact !== 1 ? 'e' : ''} und ${hoursLeftRemainder} Stunde${hoursLeftRemainder !== 1 ? 'n' : ''}`
                : 'Läuft heute ab'}
            </div>
          </div>
        )}

        {/* Aktives Abo – Info */}
        {subscriptionStatus === 'active' && (
          <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#6B7280' }}>
            Du kannst dein Abonnement im Kundenportal kündigen oder deine Zahlungsmethode ändern.
          </p>
        )}

        {/* Buttons */}
        {subscriptionStatus === 'trial' && (
          <button
            onClick={handleCancelTrial}
            disabled={cancelLoading}
            style={{
              padding: '10px 20px', borderRadius: 8, border: '1.5px solid #FCA5A5',
              background: 'white', color: '#DC2626', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: cancelLoading ? 'not-allowed' : 'pointer', opacity: cancelLoading ? 0.7 : 1,
            }}
          >
            {cancelLoading ? 'Wird beendet...' : 'Testphase kündigen'}
          </button>
        )}

        {subscriptionStatus === 'active' && (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            style={{
              padding: '10px 20px', borderRadius: 8, border: '1.5px solid #FCA5A5',
              background: 'white', color: '#DC2626', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.7 : 1,
            }}
          >
            {portalLoading ? 'Laden...' : 'Abo kündigen →'}
          </button>
        )}
      </div>
    </div>
  );
}
