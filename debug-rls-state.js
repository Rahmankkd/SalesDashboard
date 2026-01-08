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
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']; // MUST use service key to read system catalogs

const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkPolicies() {
    console.log("--- Checking Active RLS Policies on 'profiles' ---");

    // Query pg_policies system view
    // Note: We can't query pg_policies directly via Supabase JS client usually unless configured, 
    // but we can try rpc() if we had one. 
    // actually, let's try to infer it or use a raw query if possible? 
    // Supabase JS doesn't support raw SQL query directly.

    // WORKAROUND: We can't easily query pg_policies from here without an RPC.
    // However, we can TRY to just disable RLS using the Admin API if possible? No.

    // Let's try to verify the function existence again, maybe the user ran it in a different schema?

    const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_claimed_role');
    console.log("Function 'get_my_claimed_role' Check:");
    if (rpcError) console.log("   ❌ Error calling function:", rpcError.message);
    else console.log("   ✅ Function callable (Returned:", rpcData, ")");

    console.log("\n--- Attempting to read profiles (Service Role - Should Bypass RLS) ---");
    const { data: profiles, error: dbError } = await supabase.from('profiles').select('id, role, email').limit(3);
    if (dbError) {
        console.error("   ❌ Service Role blocked?!:", dbError.message);
    } else {
        console.log("   ✅ Service Role access OK (Rows:", profiles.length, ")");
    }

    // Checking if we can detect the recursion by simulating a user call
    console.log("\n--- Simulating User Call (Should Fail if Recursive) ---");
    // We can't easily simulate without a user session token.
    // But we know it fails for the user.
}

checkPolicies();
