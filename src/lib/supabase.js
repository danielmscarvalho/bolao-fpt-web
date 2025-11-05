import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjnkzoqxgjqwwcndsmba.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqbmt6b3F4Z2pxd3djbmRzbWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTA2NjksImV4cCI6MjA3Nzc2NjY2OX0.E2PHqYyOnPlbKGKYSv0y9f-fx2aNj-RO_-R2FMTU5N0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

