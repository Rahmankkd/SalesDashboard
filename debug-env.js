const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function checkEnv() {
    console.log("--- Checking .env.local ---");
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        return;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/"/g, ''); // simple parse
            envVars[key] = val;
        }
    });

    const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const anonOptions = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

    console.log(`URL Found: ${!!url}`);
    if (url) console.log(`URL: ${url}`);

    console.log(`Anon Key Found: ${!!anonOptions}`);
    if (anonOptions) console.log(`Anon Key starts with: ${anonOptions.substring(0, 5)}...`);

    console.log(`Service Key Found: ${!!serviceKey}`);
    if (serviceKey) {
        console.log(`Service Key starts with: ${serviceKey.substring(0, 5)}...`);
        if (serviceKey === anonOptions) {
            console.error("❌ CRITICAL: Service Key is IDENTICAL to Anon Key!");
        } else {
            console.log("✅ Service Key is different from Anon Key.");
        }
    } else {
        console.error("❌ Service Key is MISSING!");
    }

    if (url && serviceKey) {
        console.log("\n--- Testing Admin Client ---");
        try {
            const supabase = createClient(url, serviceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
            console.log("Client created. Attempting listUsers...");
            const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

            if (error) {
                console.error("❌ List Users Failed:", error.message);
                console.error("Full Error:", JSON.stringify(error, null, 2));
            } else {
                console.log("✅ List Users Success!");
                console.log(`Found ${data.users.length} users (page 1).`);
            }
        } catch (err) {
            console.error("❌ Exception during test:", err.message);
        }
    }
}

checkEnv();
