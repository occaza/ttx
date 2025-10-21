// src/lib/server/supabase.server.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY, NOTEPAD_ENCRYPTION_KEY } from '$env/static/private';

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/* export key agar modul enkripsi bisa pakai */
export const ENCRYPTION_KEY_SERVER = NOTEPAD_ENCRYPTION_KEY;
