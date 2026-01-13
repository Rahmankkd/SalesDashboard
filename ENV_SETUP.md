# Environment Variables Setup Guide
# =================================
# This file explains how to configure environment variables securely.
# DO NOT put actual secrets in this file - it's for documentation only!

## For Local Development

1. Create a file named `.env.local` in the project root
2. Copy the template below and replace with your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=https://ajnefxfkterabnzluqwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmVmeGZrdGVyYWJuemx1cXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjI5MjcsImV4cCI6MjA4MzE5ODkyN30.M5QSwskeag4eR9vw8t88jGZy0A-nsFf-emMSZyY7Wr4

# ⚠️ CRITICAL: Service Role Key (Get from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

3. The `.env.local` file is automatically ignored by git (safe!)

## For Cloudflare Pages Deployment

1. Go to: Cloudflare Dashboard → Pages → sales-tracker → Settings → Environment Variables
2. Add variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [Your service role key from Supabase]
   - Environment: Production (and Preview if needed)
3. Redeploy to apply changes

## Security Checklist

- [ ] SERVICE_ROLE_KEY is NOT in wrangler.toml ✓ (fixed)
- [ ] .env.local is in .gitignore ✓ (yes)
- [ ] Cloudflare environment variable is set (do this!)
- [ ] Old SERVICE_ROLE_KEY rotated in Supabase (do this!)

## What Happened?

The SERVICE_ROLE_KEY was accidentally committed to wrangler.toml and pushed to the repository.
This has been fixed by removing it and moving to environment variables instead.

**IMPORTANT**: You MUST rotate (regenerate) the SERVICE_ROLE_KEY in Supabase Dashboard
since the old one was exposed!
