const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function simpleCheck() {
    // Get all reports from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
        .from('sales_reports')
        .select('date, outlet_id, outlets(name)')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    console.log(`\nFound ${data?.length || 0} reports from last 24 hours:\n`);
    data?.forEach((r, i) => {
        console.log(`${i + 1}. ${r.outlets?.name || 'Unknown'}`);
        console.log(`   Date field: ${r.date}`);
        console.log(`   Date type: ${typeof r.date}`);
        console.log('');
    });
}

simpleCheck();
