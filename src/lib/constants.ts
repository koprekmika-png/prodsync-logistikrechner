import type { GeruestTyp, Fahrzeug } from './types';

export const GERUEST_TYPEN: GeruestTyp[] = [
  { id: "fassade",  label: "Fassadengerüst", icon: "🏗️", beschreibung: "Außengerüst entlang einer Fassade",     felder: ["laenge","hoehe","tiefe","arbeitsebenen"], feldlaenge: 2.57, stielhoehe: 2.0 },
  { id: "raum",     label: "Raumgerüst",      icon: "🏛️", beschreibung: "Freistehendes Gerüst im Innenbereich",  felder: ["laenge","breite","hoehe","arbeitsebenen"], feldlaenge: 2.57, stielhoehe: 2.0 },
  { id: "dachfang", label: "Dachfanggerüst",  icon: "🏠", beschreibung: "Absturzsicherung entlang der Traufe",   felder: ["laenge","hoehe","auskragung"],             feldlaenge: 2.57, stielhoehe: 2.0 },
  { id: "trag",     label: "Traggerüst",       icon: "⚙️", beschreibung: "Lasttragendes Unterstellgerüst",        felder: ["laenge","breite","hoehe"],                 feldlaenge: 1.57, stielhoehe: 1.0 },
];

export const FELD_CONFIG: Record<string, { label: string; suffix: string; hint: string }> = {
  laenge:        { label: "Länge",         suffix: "m", hint: "Gesamtlänge der Gerüststrecke" },
  hoehe:         { label: "Höhe",          suffix: "m", hint: "Gesamthöhe des Gerüsts" },
  tiefe:         { label: "Tiefe",         suffix: "m", hint: "Gerüsttiefe (Standard: 0,73 m)" },
  breite:        { label: "Breite",        suffix: "m", hint: "Innenbreite des Gerüsts" },
  arbeitsebenen: { label: "Arbeitsebenen", suffix: "",  hint: "Anzahl begehbarer Ebenen" },
  auskragung:    { label: "Auskragung",    suffix: "m", hint: "Horizontale Ausladung" },
};

export const DEMO_FUHRPARK: Fahrzeug[] = [
  { id: 1, name: "Mercedes Actros 18t", typ: "18t LKW",     nutzlast: 12000, ladeflaeche: "7,2 × 2,4 × 2,8 m" },
  { id: 2, name: "MAN TGM 12t",         typ: "12t LKW",     nutzlast: 7500,  ladeflaeche: "6,0 × 2,4 × 2,4 m" },
  { id: 3, name: "Mercedes Sprinter",   typ: "Transporter", nutzlast: 1500,  ladeflaeche: "3,5 × 1,8 × 1,9 m" },
];
