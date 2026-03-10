import { GERUEST_TYPEN } from './constants';
import type { Berechnungsergebnis, Fahrzeug } from './types';

function rd(n: number) { return Math.round(n * 100) / 100; }

export function berechne(
  typ: string,
  masze: Record<string, string>,
  fuhrpark: Fahrzeug[]
): Berechnungsergebnis | null {
  const t = GERUEST_TYPEN.find(t => t.id === typ);
  if (!t) return null;

  const L      = parseFloat(masze.laenge) || 0;
  const H      = parseFloat(masze.hoehe)  || 0;
  const B      = parseFloat(masze.breite || masze.tiefe || masze.auskragung || '0') || 0;
  const ebenen = parseInt(masze.arbeitsebenen || '1') || 1;

  const felder_h_raw = L / t.feldlaenge;
  const felder_v_raw = H / t.stielhoehe;
  const felder_h = Math.ceil(felder_h_raw);
  const felder_v = Math.ceil(felder_v_raw);

  let flaeche = 0;
  let flaecheFormel = '';
  if (typ === 'fassade')  { flaeche = L * H;                    flaecheFormel = `${L} m × ${H} m`; }
  if (typ === 'raum')     { flaeche = (2*L + 2*B) * H;          flaecheFormel = `(2×${L}m + 2×${B}m) × ${H}m`; }
  if (typ === 'dachfang') { flaeche = L * H;                    flaecheFormel = `${L} m × ${H} m`; }
  if (typ === 'trag')     { flaeche = L * B * (H/t.stielhoehe); flaecheFormel = `${L}m × ${B}m × ${rd(H/t.stielhoehe)} Ebenen`; }

  const stielGewicht  = t.stielhoehe  >= 2.0 ? 7.5  : 4.0;
  const riegelGewicht = t.feldlaenge  >= 2.0 ? 7.1  : 5.5;
  const belagGewicht  = t.feldlaenge  >= 2.0 ? 13.5 : 9.0;

  const anz_stiele    = (felder_h + 1) * (felder_v + 1);
  const anz_riegel    = felder_h * felder_v * 2;
  const anz_belaege   = felder_h * ebenen;
  const anz_diag      = Math.ceil(felder_h * (felder_v / 2));
  const anz_gelaender = felder_h * ebenen;
  const anz_spindeln  = (felder_h + 1) * 2;

  const stueckliste = [
    { name: "Stiele",         anzahl: anz_stiele,    ew: stielGewicht,  gesamt: Math.round(anz_stiele    * stielGewicht),  formel: `(${felder_h}+1) × (${felder_v}+1) = ${anz_stiele} Stk` },
    { name: "Riegel",         anzahl: anz_riegel,    ew: riegelGewicht, gesamt: Math.round(anz_riegel    * riegelGewicht), formel: `${felder_h} × ${felder_v} × 2 = ${anz_riegel} Stk` },
    { name: "Beläge",         anzahl: anz_belaege,   ew: belagGewicht,  gesamt: Math.round(anz_belaege   * belagGewicht),  formel: `${felder_h} × ${ebenen} Ebenen = ${anz_belaege} Stk` },
    { name: "Diagonalen",     anzahl: anz_diag,      ew: 5.2,           gesamt: Math.round(anz_diag      * 5.2),           formel: `${felder_h} × (${felder_v}÷2) = ${anz_diag} Stk` },
    { name: "Geländerriegel", anzahl: anz_gelaender, ew: 4.8,           gesamt: Math.round(anz_gelaender * 4.8),           formel: `${felder_h} × ${ebenen} Ebenen = ${anz_gelaender} Stk` },
    { name: "Fußspindeln",    anzahl: anz_spindeln,  ew: 3.8,           gesamt: Math.round(anz_spindeln  * 3.8),           formel: `(${felder_h}+1) × 2 = ${anz_spindeln} Stk` },
  ];

  const gesamt_netto = stueckliste.reduce((s, p) => s + p.gesamt, 0);
  const puffer       = Math.round(gesamt_netto * 0.1);
  const gesamt       = gesamt_netto + puffer;

  const fahrzeuge = fuhrpark.map(fz => {
    const touren = Math.ceil(gesamt / fz.nutzlast);
    // Wie voll ist die letzte Tour? (die anderen sind 100% voll)
    const restgewicht = gesamt - ((touren - 1) * fz.nutzlast);
    const beladen = Math.round((restgewicht / fz.nutzlast) * 100);
    const frei = 100 - beladen;
    return { ...fz, touren, auslastung: beladen, frei, beladen };
  }).sort((a, b) => {
    // 1. Erst nach wenigsten Touren
    if (a.touren !== b.touren) return a.touren - b.touren;
    // 2. Bei gleicher Touranzahl: höhere Beladung gewinnt
    return b.beladen - a.beladen;
  });

  const rechenweg = [
    {
      titel: "Schritt 1 – Eingaben",
      zeilen: [
        { label: "Länge",         wert: `${L} m` },
        { label: "Höhe",          wert: `${H} m` },
        ...(B > 0 ? [{ label: "Tiefe / Breite / Auskragung", wert: `${B} m` }] : []),
        { label: "Arbeitsebenen", wert: `${ebenen}` },
        { label: "Gerüsttyp",     wert: t.label },
        { label: "Feldlänge",     wert: `${t.feldlaenge} m` },
        { label: "Stielhöhe",     wert: `${t.stielhoehe} m` },
      ],
    },
    {
      titel: "Schritt 2 – Feldberechnung",
      zeilen: [
        { label: "Felder horizontal", formel: `${L} m ÷ ${t.feldlaenge} m`, zwischenwert: `= ${rd(felder_h_raw)}`, wert: `→ ${felder_h} Felder (aufgerundet)` },
        { label: "Felder vertikal",   formel: `${H} m ÷ ${t.stielhoehe} m`, zwischenwert: `= ${rd(felder_v_raw)}`, wert: `→ ${felder_v} Lagen (aufgerundet)` },
        { label: "Gerüstfläche",      formel: flaecheFormel,                  wert: `= ${Math.round(flaeche)} m²` },
      ],
    },
    {
      titel: "Schritt 3 – Stückzahlen",
      zeilen: stueckliste.map(p => ({ label: p.name, formel: p.formel, wert: `${p.anzahl} Stk` })),
    },
    {
      titel: "Schritt 4 – Gewichte",
      zeilen: [
        ...stueckliste.map(p => ({ label: p.name, formel: `${p.anzahl} Stk × ${p.ew} kg`, wert: `${p.gesamt} kg` })),
        { label: "Zwischensumme", wert: `${gesamt_netto} kg`, trennlinie: true },
        { label: "Puffer +10%",   formel: `${gesamt_netto} kg × 0,10`, wert: `+ ${puffer} kg` },
        { label: "Gesamtgewicht", wert: `${gesamt.toLocaleString('de')} kg`, fett: true },
      ],
    },
    {
      titel: "Schritt 5 – Fahrzeugoptimierung",
      zeilen: fahrzeuge.map((fz, i) => ({
        label: fz.name,
        formel: `${gesamt.toLocaleString('de')} kg ÷ ${fz.nutzlast.toLocaleString('de')} kg Nutzlast`,
        wert: `${fz.touren} Tour${fz.touren > 1 ? 'en' : ''} · ${fz.beladen}% beladen · ${fz.frei}% frei`,
        highlight: i === 0,
      })),
    },
  ];

  return { felder_h, felder_v, flaeche: Math.round(flaeche), stueckliste, gesamt_netto, puffer, gesamt, fahrzeuge, rechenweg };
}
