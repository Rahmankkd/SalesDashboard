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

const KEEP_EMAIL = 'abdpro88@gmail.com';

async function forceCleanup() {
    console.log(`--- FORCE Cleanup (Keeping: ${KEEP_EMAIL}) ---`);

    // 1. List Users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) { console.error("Error listing users:", error); return; }

    for (const user of users) {
        if (user.email === KEEP_EMAIL) {
            console.log(`✅ Skipping (Keep): ${user.email}`);
            continue;
        }

        console.log(`Targeting: ${user.email} (${user.id})`);

        // A. Try deleting Profile FIRST (Manual Cascade)
        console.log(`   1. Deleting Profile...`);
        const { error: profError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profError) console.error(`      Profile Delete Error: ${profError.message}`);
        else console.log(`      Profile Deleted.`);

        // B. Delete Auth User
        console.log(`   2. Deleting Auth User...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error(`      Auth Delete FAILED: ${deleteError.message}`);
        } else {
            console.log(`      Auth User DELETED.`);
        }
    }
}

forceCleanup();
