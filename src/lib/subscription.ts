import { supabase } from './supabase';

export interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialDaysLeft: number;
  isActive: boolean;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'expired', trialDaysLeft: 0, isActive: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('trial_start, subscription_status')
    .eq('id', user.id)
    .single();

  if (!profile) return { status: 'expired', trialDaysLeft: 0, isActive: false };

  // Aktives Abo
  if (profile.subscription_status === 'active') {
    return { status: 'active', trialDaysLeft: 0, isActive: true };
  }

  // Explizit expired oder cancelled
  if (profile.subscription_status === 'expired' || profile.subscription_status === 'cancelled') {
    return { status: 'expired', trialDaysLeft: 0, isActive: false };
  }

  // Trial berechnen (nur wenn status === 'trial')
  if (profile.trial_start) {
    const trialStart = new Date(profile.trial_start);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
    const trialDaysLeft = Math.max(0, 7 - daysPassed);
    if (trialDaysLeft > 0) {
      return { status: 'trial', trialDaysLeft, isActive: true };
    }
  }

  return { status: 'expired', trialDaysLeft: 0, isActive: false };
}
