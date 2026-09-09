const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
  console.log('⚠️ Supabase credentials not set in .env.local.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('Seeding 4 Personal Categories to Supabase...');
  const categories = [
    { name: 'Aku Sebagai Ayah', slug: 'sebagai-ayah', icon: 'heart', sort_order: 1 },
    { name: 'Aku Sebagai Engineer', slug: 'sebagai-engineer', icon: 'code', sort_order: 2 },
    { name: 'Aku Sebagai Gamer', slug: 'sebagai-gamer', icon: 'gamepad', sort_order: 3 },
    { name: 'Aku Sebagai ASN', slug: 'sebagai-asn', icon: 'landmark', sort_order: 4 },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    if (error) console.log('Notice on', cat.name, error.message);
  }
  console.log('✅ 4 Personal Categories seeded successfully!');
}

seed();
