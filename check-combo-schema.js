const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
});

const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(url, serviceKey);

async function checkSchema() {
    console.log("--- Checking 'sales_reports' Schema for 'combo_details' ---");
    const { data, error } = await supabase.from('sales_reports').select('combo_details').limit(1);

    if (error) {
        console.error("Error accessing combo_details:", error.message);
    } else {
        console.log("Success! 'combo_details' column is accessible.");
        if (data.length > 0) console.log("Sample data:", data[0]);
    }
}

checkSchema();
