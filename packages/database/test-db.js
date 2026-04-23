require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function main() {
  const { data, error } = await supabase.from('products').select('*').limit(5);
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  console.log('Products:', JSON.stringify(data, null, 2));
}

main();
