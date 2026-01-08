const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env directly to avoid next.js reliance for this script
const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!url || !serviceKey) {
    console.error("Missing keys in .env.local");
    process.exit(1);
}

const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function inspect() {
    console.log("--- Inspecting auth.users (Top 5) ---");
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ perPage: 5 });
    if (authError) console.error("Auth Error:", authError);
    else {
        users.forEach(u => console.log(`Auth User: ${u.email} (ID: ${u.id})`));
    }

    console.log("\n--- Inspecting public.profiles (Top 5) ---");
    const { data: profiles, error: dbError } = await supabase.from('profiles').select('*').limit(5);
    if (dbError) console.error("DB Error:", dbError);
    else {
        if (profiles.length === 0) console.log("No profiles found.");
        profiles.forEach(p => console.log(`Profile: ${p.email} | Role: ${p.role} | ID: ${p.id}`));
    }
}

inspect();
