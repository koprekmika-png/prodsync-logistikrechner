import type { Berechnungsergebnis } from './types';

export function exportPdf(
  ergebnis: Berechnungsergebnis,
  projektname: string,
  geruesttyp: string
): void {
  const opt = ergebnis.fahrzeuge[0];
  const datum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const stuecklisteRows = ergebnis.stueckliste
    .map(p => `
      <tr>
        <td>${p.name}</td>
        <td class="mono">${p.formel}</td>
        <td class="num">${p.anzahl} Stk</td>
        <td class="num">${p.ew} kg/Stk</td>
        <td class="num bold">${p.gesamt} kg</td>
      </tr>`)
    .join('');

  const fahrzeugeRows = ergebnis.fahrzeuge
    .map((fz, i) => `
      <tr class="${i === 0 ? 'optimal' : ''}">
        <td>${fz.name}${i === 0 ? ' <span class="badge">Optimal</span>' : ''}</td>
        <td>${fz.typ}</td>
        <td class="num">${fz.nutzlast.toLocaleString('de')} kg</td>
        <td class="num bold">${fz.touren}</td>
        <td class="num">${fz.beladen}%</td>
        <td class="num">${fz.frei}%</td>
      </tr>`)
    .join('');

  const rechenwegHtml = ergebnis.rechenweg.map(schritt => `
    <div class="schritt">
      <div class="schritt-titel">${schritt.titel}</div>
      <table>
        ${schritt.zeilen.map(z => `
          <tr class="${z.fett ? 'fett' : ''} ${z.highlight ? 'highlight' : ''} ${z.trennlinie ? 'trennlinie' : ''}">
            <td>${z.label}</td>
            <td class="mono dim">${z.formel ?? ''}</td>
            <td class="mono dim">${z.zwischenwert ?? ''}</td>
            <td class="num">${z.wert ?? ''}</td>
          </tr>`).join('')}
      </table>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${projektname}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #111;
      background: white;
      padding: 32px 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 2px solid #F97316;
    }
    .logo { font-size: 20px; font-weight: 800; color: #F97316; letter-spacing: -0.5px; }
    .logo span { color: #111; }
    .meta { text-align: right; font-size: 10px; color: #6B7280; }
    .meta strong { color: #111; font-size: 12px; display: block; margin-bottom: 2px; }
    h1 { font-size: 17px; font-weight: 800; color: #111; margin-bottom: 4px; }
    .subtitle { font-size: 11px; color: #6B7280; margin-bottom: 22px; }
    .banner {
      background: #F97316;
      color: white;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .banner-label { font-size: 10px; opacity: 0.7; margin-bottom: 2px; }
    .banner-value { font-size: 20px; font-weight: 800; }
    .banner-sub { font-size: 10px; opacity: 0.7; margin-top: 2px; }
    .stats { display: flex; gap: 32px; }
    .stat { text-align: center; }
    .stat-val { font-size: 20px; font-weight: 800; }
    .stat-lbl { font-size: 10px; opacity: 0.7; }
    section { margin-bottom: 20px; }
    section h2 {
      font-size: 11px;
      font-weight: 700;
      color: #F97316;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      font-size: 10px;
      font-weight: 700;
      color: #6B7280;
      text-align: left;
      padding: 5px 8px;
      background: #F9FAFB;
      border-bottom: 1px solid #E5E7EB;
    }
    td { padding: 5px 8px; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; }
    .mono { font-family: 'Courier New', monospace; font-size: 10px; color: #9CA3AF; }
    .dim { color: #9CA3AF; }
    .bold { font-weight: 700; color: #F97316; }
    .optimal td { background: #FFF7ED; }
    .badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      background: #FEE2D5;
      color: #EA580C;
      border-radius: 3px;
      padding: 1px 5px;
      margin-left: 4px;
    }
    .fett td { font-weight: 700; color: #F97316; }
    .highlight td { background: #FFF7ED; }
    .trennlinie td { border-top: 2px solid #E5E7EB; }
    .schritt { margin-bottom: 16px; }
    .schritt-titel {
      font-size: 10px;
      font-weight: 700;
      color: #F97316;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 8px;
      background: #FFF7ED;
      border-radius: 6px;
      margin-top: 6px;
    }
    .total-row span:last-child { color: #F97316; }
    footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #E5E7EB;
      font-size: 9px;
      color: #9CA3AF;
      text-align: center;
    }
    @media print {
      body { padding: 16px 20px; }
      @page { margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Prodsync<span>.</span></div>
      <div style="font-size:10px;color:#6B7280;margin-top:2px;">Logistikrechner</div>
    </div>
    <div class="meta">
      <strong>${projektname}</strong>
      ${geruesttyp} · Erstellt am ${datum}
    </div>
  </div>

  <h1>${projektname}</h1>
  <div class="subtitle">${geruesttyp} · ${datum}</div>

  <!-- Empfehlungs-Banner -->
  ${opt ? `
  <div class="banner">
    <div>
      <div class="banner-label">Optimales Fahrzeug</div>
      <div class="banner-value">${opt.name}</div>
      <div class="banner-sub">${opt.typ} · ${opt.nutzlast.toLocaleString('de')} kg Nutzlast</div>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-val">${opt.touren}</div>
        <div class="stat-lbl">Touren</div>
      </div>
      <div class="stat">
        <div class="stat-val">${opt.beladen}%</div>
        <div class="stat-lbl">beladen</div>
      </div>
      <div class="stat">
        <div class="stat-val">${opt.frei}%</div>
        <div class="stat-lbl">frei</div>
      </div>
      <div class="stat">
        <div class="stat-val">${ergebnis.gesamt.toLocaleString('de')}</div>
        <div class="stat-lbl">kg gesamt</div>
      </div>
    </div>
  </div>` : ''}

  <!-- Stückliste -->
  <section>
    <h2>Stückliste</h2>
    <table>
      <thead>
        <tr>
          <th>Bauteil</th>
          <th>Formel</th>
          <th class="num">Anzahl</th>
          <th class="num">Einzelgew.</th>
          <th class="num">Gesamt</th>
        </tr>
      </thead>
      <tbody>
        ${stuecklisteRows}
        <tr>
          <td colspan="4" style="font-weight:700;text-align:right;border-top:2px solid #E5E7EB;padding-top:8px;">Netto-Gesamtgewicht</td>
          <td class="num bold" style="border-top:2px solid #E5E7EB;">${ergebnis.gesamt_netto.toLocaleString('de')} kg</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align:right;color:#6B7280;">Sicherheitspuffer +10%</td>
          <td class="num" style="color:#6B7280;">+ ${ergebnis.puffer.toLocaleString('de')} kg</td>
        </tr>
      </tbody>
    </table>
    <div class="total-row">
      <span>Gesamt inkl. Puffer</span>
      <span>${ergebnis.gesamt.toLocaleString('de')} kg</span>
    </div>
  </section>

  <!-- Fahrzeugvergleich -->
  <section>
    <h2>Fahrzeugvergleich</h2>
    <table>
      <thead>
        <tr>
          <th>Fahrzeug</th>
          <th>Typ</th>
          <th class="num">Nutzlast</th>
          <th class="num">Touren</th>
          <th class="num">Beladen</th>
          <th class="num">Frei</th>
        </tr>
      </thead>
      <tbody>${fahrzeugeRows}</tbody>
    </table>
  </section>

  <!-- Rechenweg -->
  <section>
    <h2>Rechenweg</h2>
    ${rechenwegHtml}
  </section>

  <footer>
    Erstellt mit dem Logistikrechner · ${datum}
  </footer>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Bitte erlaube Popups für den PDF-Export.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

export function exportHistoriePdf(eintrag: {
  datum: string;
  projektname: string;
  geruesttyp: string;
  gesamt_kg: number;
  touren: number;
  fahrzeug: string;
}): void {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${eintrag.projektname}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #111; background: white; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #F97316; }
    .logo { font-size: 20px; font-weight: 800; color: #F97316; }
    .meta { text-align: right; font-size: 11px; color: #6B7280; }
    h1 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
    .sub { color: #6B7280; margin-bottom: 32px; }
    .card { background: #F9FAFB; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
    .row:last-child { border-bottom: none; }
    .lbl { color: #6B7280; }
    .val { font-weight: 700; }
    .orange { color: #F97316; }
    footer { margin-top: 40px; font-size: 10px; color: #9CA3AF; text-align: center; }
    @media print { @page { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Logistikrechner</div>
    <div class="meta">Erstellt am ${eintrag.datum}</div>
  </div>
  <h1>${eintrag.projektname}</h1>
  <div class="sub">${eintrag.geruesttyp} · ${eintrag.datum}</div>
  <div class="card">
    <div class="row"><span class="lbl">Gerüsttyp</span><span class="val">${eintrag.geruesttyp}</span></div>
    <div class="row"><span class="lbl">Gesamtgewicht</span><span class="val orange">${eintrag.gesamt_kg.toLocaleString('de')} kg</span></div>
    <div class="row"><span class="lbl">Optimales Fahrzeug</span><span class="val">${eintrag.fahrzeug}</span></div>
    <div class="row"><span class="lbl">Touren</span><span class="val">${eintrag.touren}</span></div>
  </div>
  <footer>Erstellt mit dem Logistikrechner · ${eintrag.datum}</footer>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=700,height=500');
  if (!win) {
    alert('Bitte erlaube Popups für den PDF-Export.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
