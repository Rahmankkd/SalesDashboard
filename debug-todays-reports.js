const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTodaysReports() {
    console.log('=== Checking Today\'s Reports ===\n');

    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    console.log('Today\'s date:', todayStr);
    console.log('Local time:', today.toLocaleString());
    console.log('ISO time:', today.toISOString());
    console.log('');

    // Query 1: All reports from today
    console.log('Query 1: Reports from today using date string filter');
    const { data: reports1, error: error1 } = await supabase
        .from('sales_reports')
        .select('id, date, outlet_id, outlets(name)')
        .gte('date', `${todayStr}T00:00:00`)
        .lt('date', `${todayStr}T23:59:59`);

    if (error1) {
        console.log('Error:', error1.message);
    } else {
        console.log(`Found ${reports1?.length || 0} reports:`);
        reports1?.forEach(r => {
            console.log(`  - ${r.outlets?.name} (ID: ${r.outlet_id})`);
            console.log(`    Date stored: ${r.date}`);
        });
    }
    console.log('');

    // Query 2: All recent reports
    console.log('Query 2: Last 10 reports (for comparison)');
    const { data: reports2, error: error2 } = await supabase
        .from('sales_reports')
        .select('id, date, outlet_id, outlets(name)')
        .order('date', { ascending: false })
        .limit(10);

    if (error2) {
        console.log('Error:', error2.message);
    } else {
        console.log(`Found ${reports2?.length || 0} recent reports:`);
        reports2?.forEach(r => {
            console.log(`  - ${r.outlets?.name} (ID: ${r.outlet_id})`);
            console.log(`    Date stored: ${r.date}`);
        });
    }
    console.log('');

    // Query 3: All outlets
    console.log('Query 3: All active outlets');
    const { data: outlets, error: error3 } = await supabase
        .from('outlets')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

    if (error3) {
        console.log('Error:', error3.message);
    } else {
        console.log(`Found ${outlets?.length || 0} active outlets:`);
        outlets?.forEach(o => {
            const hasReport = reports1?.some(r => r.outlet_id === o.id);
            console.log(`  ${hasReport ? '✓' : '✗'} ${o.name} (ID: ${o.id})`);
        });
    }
}

checkTodaysReports().catch(console.error);
