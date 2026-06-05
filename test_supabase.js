const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lpvzjuuhjbsjzwccjxvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdnpqdXVoamJzanp3Y2NqeHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDc1MTQsImV4cCI6MjA5NTk4MzUxNH0.TGc3sFdaJnMyRddK532JUaMuMnP2VGVpjllNJ9uslY8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('categories').select('*').limit(1);
  if (error) {
    console.error('categories table error:', error);
  } else {
    console.log('categories table exists! Data:', data);
  }
  
  const { data: d2, error: e2 } = await supabase.from('custom_categories').select('*').limit(1);
  if (e2) {
    console.error('custom_categories table error:', e2);
  } else {
    console.log('custom_categories table exists! Data:', d2);
  }
}

test();
