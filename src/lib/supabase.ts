import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://azroyraapksmsrrsczbc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s9MYy5KoHDAC0V8vhVMVlw_lmiI3axF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
