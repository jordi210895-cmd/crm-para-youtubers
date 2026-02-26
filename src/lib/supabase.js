import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-url')) {
    console.error('CRITICAL: Supabase environment variables are missing or incorrect!');
    console.log('VITE_SUPABASE_URL:', supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Missing');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
