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

async function testCreate() {
    const email = `test_admin_${Date.now()}@example.com`;
    const password = 'Password123!';
    const role = 'admin';

    console.log(`Attempting to create user: ${email} with role: ${role}`);

    // 1. Create Auth User
    console.log("Step 1: Creating Auth User...");
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
        // NOT passing metadata yet, replicating current code behavior
    });

    if (authError) {
        console.error("❌ Step 1 FAILED (Auth Creation):");
        console.error("Message:", authError.message);
        console.error("Full Error:", JSON.stringify(authError, null, 2));
        return;
    }

    console.log("✅ Step 1 Success. User ID:", user.user.id);

    // 2. Create Profile
    console.log("Step 2: Upserting Profile...");
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.user.id,
        email: email,
        role: role
    });

    if (profileError) {
        console.error("❌ Step 2 FAILED (Profile Upsert):");
        console.error("Message:", profileError.message);
        console.error("Details:", profileError.details);
        console.error("Hint:", profileError.hint);
        console.error("Full Error:", JSON.stringify(profileError, null, 2));

        // Clean up
        console.log("Cleaning up auth user...");
        await supabase.auth.admin.deleteUser(user.user.id);
        return;
    }

    console.log("✅ Step 2 Success. User and Profile created!");
}

testCreate();
