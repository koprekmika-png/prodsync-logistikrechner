import type { Fahrzeug, GespeicherteBerechnnung } from './types';
import { DEMO_FUHRPARK } from './constants';

const FUHRPARK_KEY = 'prodsync_fuhrpark';
const HISTORIE_KEY = 'prodsync_historie';

export function fuhrparkLaden(): Fahrzeug[] {
  try {
    const raw = localStorage.getItem(FUHRPARK_KEY);
    return raw ? JSON.parse(raw) : DEMO_FUHRPARK;
  } catch {
    return DEMO_FUHRPARK;
  }
}

export function fuhrparkSpeichern(fuhrpark: Fahrzeug[]): void {
  localStorage.setItem(FUHRPARK_KEY, JSON.stringify(fuhrpark));
}

export function historieLaden(): GespeicherteBerechnnung[] {
  try {
    const raw = localStorage.getItem(HISTORIE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function historieSpeichern(eintrag: GespeicherteBerechnnung): void {
  const liste = historieLaden();
  liste.unshift(eintrag);
  localStorage.setItem(HISTORIE_KEY, JSON.stringify(liste.slice(0, 50)));
}
