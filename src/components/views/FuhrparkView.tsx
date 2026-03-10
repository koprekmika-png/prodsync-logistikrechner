import { useState, useEffect } from 'react';
import { fuhrparkLaden, fuhrparkHinzufuegen, fuhrparkLoeschen } from '../../lib/storage';
import type { Fahrzeug } from '../../lib/types';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import NumInput from '../ui/NumInput';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '2px solid #E5E7EB',
  borderRadius: 10,
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
};

export default function FuhrparkView() {
  const [fuhrpark, setFuhrpark] = useState<Fahrzeug[]>([]);
  const [formOffen, setFormOffen] = useState(false);
  const [neu, setNeu] = useState({ name: '', typ: '', nutzlast: '', ladeflaeche: '' });
  const [hoveredDelete, setHoveredDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laden() {
      setLoading(true);
      const data = await fuhrparkLaden();
      setFuhrpark(data);
      setLoading(false);
    }
    laden();
  }, []);

  const handleAdd = async () => {
    if (!neu.name || !neu.nutzlast) return;
    await fuhrparkHinzufuegen({
      name: neu.name,
      typ: neu.typ,
      nutzlast: parseInt(neu.nutzlast),
      ladeflaeche: neu.ladeflaeche,
    });
    const updated = await fuhrparkLaden();
    setFuhrpark(updated);
    setNeu({ name: '', typ: '', nutzlast: '', ladeflaeche: '' });
    setFormOffen(false);
  };

  const handleDelete = async (id: number) => {
    await fuhrparkLoeschen(id);
    setFuhrpark(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            Mein Fuhrpark
          </h1>
          <p style={{ color: '#6B7280', fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>
            Fahrzeuge verwalten für die Logistikberechnung
          </p>
        </div>
        <Btn onClick={() => setFormOffen(true)} small>+ Fahrzeug hinzufügen</Btn>
      </div>

      {/* Formular */}
      {formOffen && (
        <Card style={{ border: '2px solid #F97316', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
            Neues Fahrzeug
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>
                Name
              </label>
              <input
                type="text"
                value={neu.name}
                onChange={e => setNeu(p => ({ ...p, name: e.target.value }))}
                placeholder="z.B. Mercedes Actros 18t"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>
                Typ
              </label>
              <input
                type="text"
                value={neu.typ}
                onChange={e => setNeu(p => ({ ...p, typ: e.target.value }))}
                placeholder="z.B. 18t LKW"
                style={inputStyle}
              />
            </div>
            <NumInput
              label="Nutzlast in kg"
              value={neu.nutzlast}
              onChange={v => setNeu(p => ({ ...p, nutzlast: v }))}
              suffix="kg"
            />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>
                Ladefläche
              </label>
              <input
                type="text"
                value={neu.ladeflaeche}
                onChange={e => setNeu(p => ({ ...p, ladeflaeche: e.target.value }))}
                placeholder="z.B. 7,2 × 2,4 × 2,8 m"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn outline small onClick={() => { setFormOffen(false); setNeu({ name: '', typ: '', nutzlast: '', ladeflaeche: '' }); }}>
              Abbrechen
            </Btn>
            <Btn small onClick={handleAdd} disabled={!neu.name || !neu.nutzlast}>
              Speichern
            </Btn>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Fuhrpark wird geladen...
        </div>
      )}

      {/* Leerzustand */}
      {!loading && fuhrpark.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚛</div>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
            Noch keine Fahrzeuge
          </div>
          <Btn small onClick={() => setFormOffen(true)}>+ Hinzufügen</Btn>
        </div>
      )}

      {/* Fahrzeugliste */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fuhrpark.map(fz => (
            <Card key={fz.id} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>🚛</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>
                  {fz.name}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                  {fz.typ} · {fz.nutzlast.toLocaleString('de')} kg Nutzlast
                  {fz.ladeflaeche && ` · ${fz.ladeflaeche}`}
                </div>
              </div>
              <button
                onClick={() => handleDelete(fz.id)}
                onMouseEnter={() => setHoveredDelete(fz.id)}
                onMouseLeave={() => setHoveredDelete(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: hoveredDelete === fz.id ? '#EF4444' : '#9CA3AF',
                  padding: '4px 8px',
                  transition: 'color 0.15s',
                }}
                title="Fahrzeug löschen"
              >
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
