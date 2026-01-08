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

async function cleanupUsers() {
    console.log(`--- Cleaning up users (Keeping: ${KEEP_EMAIL}) ---`);

    // 1. List Users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) { console.error("Error listing users:", error); return; }

    console.log(`Found ${users.length} total users.`);

    for (const user of users) {
        if (user.email === KEEP_EMAIL) {
            console.log(`✅ Skipping (Keep): ${user.email} (${user.id})`);

            // Ensure Role is Superuser
            const { error: updateError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                role: 'superuser'
            });

            // Also update metadata to be safe
            await supabase.auth.admin.updateUserById(user.id, { user_metadata: { role: 'superuser' } });

            if (updateError) console.error(`   Failed to ensure superuser role: ${updateError.message}`);
            else console.log(`   Verified as 'superuser' in DB and Metadata.`);

        } else {
            console.log(`🗑️ Deleting: ${user.email} (${user.id})`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.error(`   Failed to delete auth user: ${deleteError.message}`);
            } else {
                // Manually cleanup profile just in case cascade didn't work (though it should)
                await supabase.from('profiles').delete().eq('id', user.id);
            }
        }
    }
    console.log("--- Cleanup Complete ---");
}

cleanupUsers();
