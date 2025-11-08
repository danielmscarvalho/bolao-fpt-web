import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zfabxlsycklxfglhjcap.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmYWJ4bHN5Y2tseGZnbGhqY2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTMwMzksImV4cCI6MjA3ODAyOTAzOX0.hJwFmenqbNs-MUpzIPgHpYMr_YBkjB8EVZVVq-lR7gs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

