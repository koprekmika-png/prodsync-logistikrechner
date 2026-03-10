import { useState, useEffect } from 'react';
import { historieLaden } from '../../lib/storage';
import type { GespeicherteBerechnnung } from '../../lib/types';
import Card from '../ui/Card';
import Btn from '../ui/Btn';

export default function HistorieView() {
  const [historie, setHistorie] = useState<GespeicherteBerechnnung[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laden() {
      setLoading(true);
      const data = await historieLaden();
      setHistorie(data);
      setLoading(false);
    }
    laden();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          Berechnungen
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>
          Alle gespeicherten Kalkulationen
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Berechnungen werden geladen...
        </div>
      )}

      {/* Leerzustand */}
      {!loading && historie.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
            Noch keine Berechnungen
          </div>
          <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            Starte eine Berechnung im Logistikrechner
          </div>
        </div>
      )}

      {/* Liste */}
      {!loading && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {historie.map(eintrag => (
          <Card key={eintrag.id} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {eintrag.projektname}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                {eintrag.datum} · {eintrag.geruesttyp}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F97316', fontFamily: "'DM Mono', monospace" }}>
                {eintrag.gesamt_kg.toLocaleString('de')} kg
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                {eintrag.touren} Tour{eintrag.touren !== 1 ? 'en' : ''} · {eintrag.fahrzeug}
              </div>
            </div>
            <Btn outline small onClick={() => alert('PDF Export folgt')}>PDF</Btn>
          </Card>
        ))}
      </div>}
    </div>
  );
}
