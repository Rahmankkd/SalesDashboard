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

async function checkSchema() {
    console.log("--- Checking Profiles Schema ---");

    // Attempt to select specific columns to see if they exist
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .limit(1);

    if (error) {
        console.error("❌ Schema Error:", error.message);
        console.error("   Detail:", error.details);
        console.error("   Hint:", error.hint);
        if (error.message.includes('created_at')) {
            console.error("   🚨 CRITICAL: 'created_at' column seems missing!");
        }
    } else {
        console.log("✅ Schema looks correct. Columns `id, email, role, created_at` exist.");
        if (data.length > 0) console.log("   Sample Data:", data[0]);
    }
}

checkSchema();
