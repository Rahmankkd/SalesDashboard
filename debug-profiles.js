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
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkProfiles() {
    console.log("--- Checking Auth vs Profiles ---");

    // 1. Get All Auth Users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) { console.error("Auth Error:", authError); return; }

    // 2. Get All Profiles
    const { data: profiles, error: dbError } = await supabase.from('profiles').select('*');
    if (dbError) { console.error("DB Error:", dbError); return; }

    console.log(`Auth Users: ${users.length}`);
    console.log(`Profile Rows: ${profiles.length}`);
    console.log("---------------------------------------------------");
    console.log(String("Email").padEnd(30), "|", String("Auth ID").padEnd(38), "|", String("Profile Role"));
    console.log("---------------------------------------------------");

    users.forEach(u => {
        const profile = profiles.find(p => p.id === u.id);
        const role = profile ? profile.role : "❌ MISSING";
        console.log(
            String(u.email).padEnd(30), "|",
            String(u.id).padEnd(38), "|",
            role
        );
    });
}

checkProfiles();
