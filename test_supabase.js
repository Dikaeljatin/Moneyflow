const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lpvzjuuhjbsjzwccjxvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdnpqdXVoamJzanp3Y2NqeHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDc1MTQsImV4cCI6MjA5NTk4MzUxNH0.TGc3sFdaJnMyRddK532JUaMuMnP2VGVpjllNJ9uslY8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('custom_categories').insert([{
    name: 'TestCategory',
    icon: '🚀',
    color: '#000000',
    iscustom: true,
    type: 'expense',
    username: 'test_user'
  }]).select().single();
  
  if (error) {
    console.error('Insert error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert success!', data);
  }
}

test();
