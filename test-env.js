const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');
const env = {};
for (let line of lines) {
  if (line.trim().startsWith('#') || !line.includes('=')) continue;
  const [key, ...rest] = line.split('=');
  env[key.trim()] = rest.join('=').trim().replace(/^[\"']|[\"']$/g, '');
}

console.log('SUPABASE URL:', env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE URL ENDS WITH SLASH:', env.NEXT_PUBLIC_SUPABASE_URL.endsWith('/'));
console.log('URL CHARS:', Array.from(env.NEXT_PUBLIC_SUPABASE_URL).map(c => c.charCodeAt(0)).join(', '));
