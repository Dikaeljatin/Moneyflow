import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('custom_categories').insert([{
    name: 'Test',
    icon: '🚀',
    color: '#000000',
    iscustom: true,
    type: 'expense',
    username: 'test_user'
  }]).select().single();
  console.log('Data:', data);
  console.log('Error:', error);
}
run();
