const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...val] = line.split('=');
    env[key.trim()] = val.join('=').trim();
  }
});

const supabaseAdmin = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function check() {
  const payload = {
    name: 'TEST CATEGORY',
    slug: 'test-category',
    description: null,
    parent_id: null,
    sort_order: 0,
    image_url: null,
    id: crypto.randomUUID()
  };

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert([payload])
    .select()
    .single();

  console.log('Insert Error:', error);
  console.log('Inserted Data:', data);
  
  if (data) {
    await supabaseAdmin.from('categories').delete().eq('id', data.id);
  }
}

check();
