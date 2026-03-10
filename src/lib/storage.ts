import { supabase } from './supabase';
import type { Fahrzeug, GespeicherteBerechnnung } from './types';
import { DEMO_FUHRPARK } from './constants';

// ── Fuhrpark ──────────────────────────────────────────────
export async function fuhrparkLaden(): Promise<Fahrzeug[]> {
  const { data, error } = await supabase
    .from('fuhrpark')
    .select('*')
    .order('created_at', { ascending: true });
  if (error || !data || data.length === 0) return DEMO_FUHRPARK;
  return data.map(f => ({
    id: f.id,
    name: f.name,
    typ: f.typ ?? '',
    nutzlast: f.nutzlast,
    ladeflaeche: f.ladeflaeche ?? '',
  }));
}

export async function fuhrparkHinzufuegen(fz: Omit<Fahrzeug, 'id'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('fuhrpark').insert({
    user_id: user.id,
    name: fz.name,
    typ: fz.typ,
    nutzlast: fz.nutzlast,
    ladeflaeche: fz.ladeflaeche,
  });
}

export async function fuhrparkLoeschen(id: number): Promise<void> {
  await supabase.from('fuhrpark').delete().eq('id', id);
}

// ── Historie ──────────────────────────────────────────────
export async function historieLaden(): Promise<GespeicherteBerechnnung[]> {
  const { data, error } = await supabase
    .from('historie')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map(h => ({
    id: h.id.toString(),
    datum: h.datum ?? '',
    projektname: h.projektname ?? '',
    geruesttyp: h.geruesttyp ?? '',
    gesamt_kg: h.gesamt_kg ?? 0,
    touren: h.touren ?? 0,
    fahrzeug: h.fahrzeug ?? '',
  }));
}

export async function historieSpeichern(eintrag: Omit<GespeicherteBerechnnung, 'id'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('historie').insert({
    user_id: user.id,
    projektname: eintrag.projektname,
    geruesttyp: eintrag.geruesttyp,
    gesamt_kg: eintrag.gesamt_kg,
    touren: eintrag.touren,
    fahrzeug: eintrag.fahrzeug,
    datum: eintrag.datum,
  });
}

// Legacy (für Kompatibilität)
export function fuhrparkSpeichern(_fuhrpark: Fahrzeug[]): void {}
