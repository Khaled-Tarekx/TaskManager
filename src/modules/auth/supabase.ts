import { createClient } from '@supabase/supabase-js';

const api_key = process.env.SUBABASE_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;

export const supabase = createClient(supabaseUrl, api_key, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false,
	},
});
