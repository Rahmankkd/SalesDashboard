const fs = require('fs');
const path = require('path');

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://ajnefxfkterabnzluqwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmVmeGZrdGVyYWJuemx1cXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjI5MjcsImV4cCI6MjA4MzE5ODkyN30.M5QSwskeag4eR9vw8t88jGZy0A-nsFf-emMSZyY7Wr4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmVmeGZrdGVyYWJuemx1cXd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyMjkyNywiZXhwIjoyMDgzMTk4OTI3fQ.5WCKlPm4TsyBPWmyjlMMwArwfamDupenuscqaKakBXo`;

fs.writeFileSync(path.join(__dirname, '.env.local'), envContent.trim());
console.log("✅ .env.local updated successfully.");
