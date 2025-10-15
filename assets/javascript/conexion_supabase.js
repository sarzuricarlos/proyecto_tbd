const SUPABASE_URL = "https://bapoikminyclqxdfxjxc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcG9pa21pbnljbHF4ZGZ4anhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjM5OTQsImV4cCI6MjA3NTkzOTk5NH0.u2N5wF0LXKnSKFpj4AfwtRxLoOqVlAQ-UgIsSnohH6Y"; // tu anon key pública

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);