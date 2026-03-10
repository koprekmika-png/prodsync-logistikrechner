export interface GeruestTyp {
  id: string;
  label: string;
  icon: string;
  beschreibung: string;
  felder: string[];
  feldlaenge: number;
  stielhoehe: number;
}

export interface Fahrzeug {
  id: number;
  name: string;
  typ: string;
  nutzlast: number;
  ladeflaeche: string;
}

export interface FahrzeugMitTouren extends Fahrzeug {
  touren: number;
  auslastung: number;
  frei: number;
  beladen: number;
}

export interface FahrzeugErgebnis extends Fahrzeug {
  touren: number;
  auslastung: number;
  frei: number;
  beladen: number;
}

export interface Stuecklistenposition {
  name: string;
  anzahl: number;
  ew: number;
  gesamt: number;
  formel: string;
}

export interface RechenZeile {
  label: string;
  wert?: string;
  formel?: string;
  zwischenwert?: string;
  trennlinie?: boolean;
  fett?: boolean;
  highlight?: boolean;
}

export interface RechenSchritt {
  titel: string;
  zeilen: RechenZeile[];
}

export interface Berechnungsergebnis {
  felder_h: number;
  felder_v: number;
  flaeche: number;
  stueckliste: Stuecklistenposition[];
  gesamt_netto: number;
  puffer: number;
  gesamt: number;
  fahrzeuge: FahrzeugMitTouren[];
  rechenweg: RechenSchritt[];
}

export interface GespeicherteBerechnnung {
  id: string;
  datum: string;
  projektname: string;
  geruesttyp: string;
  gesamt_kg: number;
  touren: number;
  fahrzeug: string;
}
