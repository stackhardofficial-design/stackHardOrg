import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnyczsikqpevioplsqln.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueWN6c2lrcXBldmlvcGxzcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTEyMzEsImV4cCI6MjEwNzEyNzIzMX0.B_olMs25ruqxN0ddznrjq0DgzDKQ5T_JO2mBPV7OT4c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
