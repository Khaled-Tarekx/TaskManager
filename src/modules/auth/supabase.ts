import { createClient } from '@supabase/supabase-js';
const service_key_role =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXZ1cGZ5dXlucWlobmhkYWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTQ4NDQxNiwiZXhwIjoyMDQxMDYwNDE2fQ.7trh-i_2rcewpZoEj8InoBBgg_mvB_foqCKHHIJStco';
const test_key =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXZ1cGZ5dXlucWlobmhkYWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0ODQ0MTYsImV4cCI6MjA0MTA2MDQxNn0.dHkfvboMOawKeh-G-Zx7BNpefIz1lQcB2W8__nuWlF8';
const supabaseUrl = process.env.SUPABASE_URL;

export const supabase = createClient(supabaseUrl, service_key_role, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false,
	},
});
