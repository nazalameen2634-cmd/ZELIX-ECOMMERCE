const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
const env = {};
for (let line of lines) {
  if (line.trim().startsWith('#') || !line.includes('=')) continue;
  const [key, ...rest] = line.split('=');
  env[key.trim()] = rest.join('=').trim().replace(/^[\"']|[\"']$/g, '');
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL.trim().replace(/\/$/, ''), env.SUPABASE_SERVICE_ROLE_KEY.trim());

const payload = {
  title: 'dfvqbhm',
  slug: 'dfvqbhm',
  description: '',
  category_id: null,
  price: 1000,
  sale_price: 1,
  sku: 'hjkl',
  stock_quantity: 10,
  track_inventory: true,
  allow_backorders: false,
  status: 'active',
  og_image_url: 'https://swissbeauty.in/cdn/shop/articles/400X400_FEB-2',
  tags: ['NEW']
};

supabase.from('products').insert([payload]).select('id').single().then(res => {
  console.log('Result:', JSON.stringify(res, null, 2));
}).catch(e => {
  console.log('Error:', e.message);
});
