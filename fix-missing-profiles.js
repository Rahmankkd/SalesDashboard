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

async function fixProfiles() {
    console.log("--- Repairing Missing Profiles (Dynamic Check) ---");

    // 1. Get All Auth Users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) { console.error("Auth Error:", authError); return; }

    // 2. Get All Profiles
    const { data: profiles, error: dbError } = await supabase.from('profiles').select('*');
    if (dbError) { console.error("DB Error:", dbError); return; }

    const profileIds = new Set(profiles.map(p => p.id));
    const missingUsers = users.filter(u => !profileIds.has(u.id));

    if (missingUsers.length === 0) {
        console.log("✅ All users have profiles. No repairs needed.");
        return;
    }

    console.log(`Found ${missingUsers.length} users with missing profiles.`);

    for (const u of missingUsers) {
        // Dynamic Role Detection: Check metadata first, default to 'user'
        const metaRole = u.user_metadata?.role;
        const role = metaRole || 'user'; // Fallback to 'user' if undefined

        console.log(`Fixing: ${u.email}`);
        console.log(`   └─ Source: ${metaRole ? 'Metadata' : 'Default'}`);
        console.log(`   └─ Role:   ${role}`);

        const { error } = await supabase.from('profiles').insert({
            id: u.id,
            email: u.email,
            role: role
        });

        if (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ Success: Profile created.`);
        }
    }
}

fixProfiles();
