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

const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkFix() {
    console.log("--- Checking for Security Function ---");

    // Attempt to call the new function
    // Even if we are anon, if the function exists, it should return (null or error), not 404
    const { data, error } = await supabase.rpc('get_my_claimed_role');

    if (error) {
        console.error("Result:", error.message);
        if (error.message.includes('Could not find the function')) {
            console.log("❌ Fix NOT detected. Function missing.");
        } else {
            console.log("⚠️ Function exists but returned error (Expected for Anon):", error.message);
        }
    } else {
        console.log("✅ Fix DETECTED. Function `get_my_claimed_role` exists (Returned:", data, ")");
    }
}

checkFix();
