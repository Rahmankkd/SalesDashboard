const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const key = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// Using ANON key to simulate client-side fetch
const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function testPublicRead() {
    console.log("--- Testing Public Read (Anon Key) ---");

    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error("❌ Read Failed:", error.message, error.details);
    } else {
        console.log(`✅ Success. Rows found: ${data.length}`);
        data.forEach(Row => console.log(`   - ${Row.email} (${Row.role})`));
        if (data.length === 0) console.log("   (Table is empty or empty result set)");
    }
}

testPublicRead();
