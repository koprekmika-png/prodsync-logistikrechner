import { useState } from 'react';
import { berechne } from '../../lib/berechne';
import { fuhrparkLaden, historieSpeichern } from '../../lib/storage';
import { GERUEST_TYPEN, FELD_CONFIG } from '../../lib/constants';
import type { Berechnungsergebnis } from '../../lib/types';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import NumInput from '../ui/NumInput';
import StepBadge from '../ui/StepBadge';
import ProgressBar from '../ui/ProgressBar';

export default function RechnerView() {
  const [step, setStep] = useState(0);
  const [gewTyp, setGewTyp] = useState<string | null>(null);
  const [masze, setMasze] = useState<Record<string, string>>({});
  const [ergebnis, setErgebnis] = useState<Berechnungsergebnis | null>(null);
  const [showRechenweg, setShowRechenweg] = useState(false);

  const typObj = GERUEST_TYPEN.find(t => t.id === gewTyp);
  const canStep2 = !!typObj && typObj.felder.every(f => masze[f] && parseFloat(masze[f]) > 0);

  const handleBerechnen = async () => {
    const fuhrpark = await fuhrparkLaden();
    const r = berechne(gewTyp!, masze, fuhrpark);
    if (!r) return;
    setErgebnis(r);
    await historieSpeichern({
      datum: new Date().toLocaleDateString('de'),
      projektname: `${typObj?.label} – ${masze.laenge}m × ${masze.hoehe}m`,
      geruesttyp: typObj?.label ?? '',
      gesamt_kg: r.gesamt,
      touren: r.fahrzeuge[0]?.touren ?? 0,
      fahrzeug: r.fahrzeuge[0]?.name ?? '',
    });
    setStep(2);
  };

  const reset = () => {
    setStep(0); setGewTyp(null); setMasze({}); setErgebnis(null); setShowRechenweg(false);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          Neue Berechnung
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>
          Gerüsttyp wählen → Maße eingeben → Logistik erhalten
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        {['Gerüsttyp', 'Maße', 'Ergebnis'].map((s, i) => (
          <StepBadge key={i} n={i + 1} label={s} active={step === i} done={step > i} />
        ))}
      </div>
      <ProgressBar step={step + 1} total={3} />

      {/* Step 0 – Gerüsttyp wählen */}
      {step === 0 && (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif", marginBottom: 18 }}>
            Welcher Gerüsttyp?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {GERUEST_TYPEN.map(t => (
              <button
                key={t.id}
                onClick={() => setGewTyp(t.id)}
                style={{
                  border: `2px solid ${gewTyp === t.id ? '#F97316' : '#E5E7EB'}`,
                  background: gewTyp === t.id ? '#FFF7ED' : 'white',
                  borderRadius: 12,
                  padding: '18px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  {t.beschreibung}
                </div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn onClick={() => setStep(1)} disabled={!gewTyp}>Weiter →</Btn>
          </div>
        </Card>
      )}

      {/* Step 1 – Maße eingeben */}
      {step === 1 && typObj && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>{typObj.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>
                {typObj.label}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                Einheiten in Metern
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {typObj.felder.map(f => {
              const cfg = FELD_CONFIG[f];
              return (
                <NumInput
                  key={f}
                  label={cfg?.label ?? f}
                  value={masze[f] ?? ''}
                  onChange={v => setMasze(prev => ({ ...prev, [f]: v }))}
                  suffix={cfg?.suffix || undefined}
                  hint={cfg?.hint}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Btn outline onClick={() => setStep(0)}>← Zurück</Btn>
            <Btn onClick={handleBerechnen} disabled={!canStep2}>Jetzt berechnen</Btn>
          </div>
        </Card>
      )}

      {/* Step 2 – Ergebnis */}
      {step === 2 && ergebnis && ergebnis.fahrzeuge.length > 0 && (
        <div>
          {/* Empfehlungs-Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            borderRadius: 14,
            padding: '26px 28px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
                {ergebnis.fahrzeuge[0].name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                {ergebnis.fahrzeuge[0].typ} · {ergebnis.fahrzeuge[0].nutzlast.toLocaleString('de')} kg Nutzlast
              </div>
            </div>
            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
              {/* Touren */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: 'white', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
                  {ergebnis.fahrzeuge[0]?.touren}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                  Touren
                </div>
              </div>

              {/* Trennlinie */}
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />

              {/* Beladen */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: 'white', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
                  {ergebnis.fahrzeuge[0]?.beladen}%
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                  beladen
                </div>
              </div>

              {/* Frei */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: 'white', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
                  {ergebnis.fahrzeuge[0]?.frei}%
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                  frei
                </div>
              </div>

              {/* Trennlinie */}
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />

              {/* Gesamtgewicht */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: 'white', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
                  {ergebnis.gesamt.toLocaleString('de')}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                  kg gesamt
                </div>
              </div>
            </div>
          </div>

          {/* Zwei Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {/* Linke Card – Alle Fahrzeuge */}
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>
                Alle Fahrzeuge
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ergebnis.fahrzeuge.map((fz, i) => (
                  <div key={fz.id} style={{
                    background: i === 0 ? '#FFF7ED' : '#F9FAFB',
                    border: `1.5px solid ${i === 0 ? '#F97316' : '#E5E7EB'}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>
                          {fz.name}
                        </span>
                        {i === 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#EA580C',
                            background: '#FEE2D5', borderRadius: 4, padding: '1px 6px',
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                            Optimal
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                        {fz.nutzlast.toLocaleString('de')} kg Nutzlast
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', fontFamily: "'DM Mono', monospace" }}>
                        {fz.touren}×
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                        {fz.beladen}% beladen · {fz.frei}% frei
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rechte Card – Rechenweg */}
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>
                Rechenweg
              </div>
              {/* Stückliste immer sichtbar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {ergebnis.stueckliste.map(p => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ color: '#6B7280' }}>{p.name}</span>
                    <span style={{ color: '#111' }}>
                      {p.anzahl} Stk ·{' '}
                      <span style={{ color: '#F97316', fontWeight: 600 }}>{p.gesamt} kg</span>
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1.5px solid #E5E7EB', paddingTop: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                  <span>Gesamt inkl. Puffer</span>
                  <span style={{ color: '#F97316' }}>→ {ergebnis.gesamt.toLocaleString('de')} kg</span>
                </div>
              </div>
              <button
                onClick={() => setShowRechenweg(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: '#F97316', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", padding: 0,
                }}
              >
                {showRechenweg ? 'Ausblenden ↑' : 'Anzeigen ↓'}
              </button>

              {/* Aufgeklappter Rechenweg */}
              {showRechenweg && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {ergebnis.rechenweg.map(schritt => (
                    <div key={schritt.titel}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: '#F97316',
                        fontFamily: "'DM Mono', monospace", textTransform: 'uppercase',
                        letterSpacing: '0.08em', marginBottom: 6,
                      }}>
                        {schritt.titel}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {schritt.zeilen.map((z, zi) => (
                          <div key={zi} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                            fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                            background: z.highlight ? '#FFF7ED' : 'transparent',
                            borderTop: z.trennlinie ? '2px solid #E5E7EB' : undefined,
                            fontWeight: z.fett ? 700 : 400,
                            color: z.fett ? '#F97316' : '#374151',
                            padding: '2px 4px',
                            borderRadius: 4,
                          }}>
                            <span style={{ color: z.fett ? '#F97316' : '#6B7280' }}>{z.label}</span>
                            <span style={{ display: 'flex', gap: 8 }}>
                              {z.formel && <span style={{ color: '#9CA3AF', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{z.formel}</span>}
                              {z.zwischenwert && <span style={{ color: '#9CA3AF', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>{z.zwischenwert}</span>}
                              <span style={{ fontWeight: z.fett ? 700 : 600 }}>{z.wert}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Aktionen */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
            <Btn outline onClick={reset}>Neue Berechnung</Btn>
            <Btn onClick={() => alert('PDF Export folgt in Phase 2')}>Als PDF exportieren</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
