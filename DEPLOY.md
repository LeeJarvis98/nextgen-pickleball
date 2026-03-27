# Deployment Guide — NextGen Pickleball

## Overview

| Resource | Value |
|---|---|
| GitHub | https://github.com/LeeJarvis98/nextgen-pickleball |
| Vercel Team | NextGen Pickleball (`team_guCnv4FtaCLXdq4izKjLO5ja`) |
| Vercel Project | `nextgen-pickleball` (`prj_P5LvQDwlBYeXrQOALldfFB6nCsgb`) |
| Production URL | https://nextgen-pickleball.vercel.app |
| Supabase Project | `zgoxowkhupnhjuwuljnb` |

---

## Prerequisites

- Node.js 18+
- Vercel CLI: `npm i -g vercel`
- Token stored in `.env.local` as `VERCEL_TOKEN` (account: `knightvvp-2660`)

> **Important:** The global Vercel CLI (`npx vercel whoami`) may be logged into a different account (`baotradi1-9443`).  
> Always pass `--token $env:VERCEL_TOKEN` to every Vercel CLI command to use the correct account.

---

## Deploy to Production

```powershell
# 1. Make your changes, then build locally to verify
npm run build

# 2. Commit and push to GitHub
git add .
git commit -m "your message"
git push origin main

# 3. Deploy to Vercel production
npm run deploy
```

---

## Preview Deploy (non-production)

```powershell
npm run deploy:preview
```

The CLI will print a unique preview URL (e.g. `https://nextgen-pickleball-xxxx.vercel.app`).

> **Why not `npx vercel deploy --token $env:VERCEL_TOKEN`?**  
> PowerShell doesn't load `.env.local` automatically, so `$env:VERCEL_TOKEN` will be empty.  
> The `npm run deploy` script reads the token from `.env.local` automatically via `scripts/deploy.mjs`.

---

## Environment Variables

Stored in `.env.local` (never commit this file):

```
STITCH_API_KEY=...           # Stitch MCP design API key
PROJECT_ID=...               # Stitch project ID
NEXT_PUBLIC_SUPABASE_URL=... # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # Supabase anon key (public, safe to expose)
VERCEL_TOKEN=...             # Vercel personal access token (account: knightvvp-2660)
```

### Adding / updating env vars on Vercel

Use the Vercel REST API (avoids interactive CLI prompts on PowerShell):

```powershell
$token = $env:VERCEL_TOKEN
$projectId = "prj_P5LvQDwlBYeXrQOALldfFB6nCsgb"
$teamId = "team_guCnv4FtaCLXdq4izKjLO5ja"

$envVars = @(
  @{ key = "MY_VAR"; value = "my_value"; type = "plain"; target = @("production", "preview", "development") }
)

Invoke-RestMethod `
  -Uri "https://api.vercel.com/v10/projects/$projectId/env?teamId=$teamId" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body (ConvertTo-Json $envVars -Depth 5)
```

Or manage them in the Vercel dashboard:  
https://vercel.com/nextgen-pickleball/nextgen-pickleball/settings/environment-variables

---

## Vercel Token

Token is scoped to account `knightvvp-2660`.  
If it expires, create a new one at:  
https://vercel.com/account/settings/tokens  
(make sure you are logged in as the correct account)

Then update `VERCEL_TOKEN` in `.env.local`.

---

## Supabase

Database is managed via the Supabase dashboard:  
https://supabase.com/dashboard/project/zgoxowkhupnhjuwuljnb

- Table: `registrations`
- RLS enabled: anon can INSERT, authenticated can SELECT

---

## Useful Commands

```powershell
# Deploy to production
npm run deploy

# Deploy to preview
npm run deploy:preview

# Check which account the token belongs to
node -e "
  const fs = require('fs');
  const token = fs.readFileSync('.env.local','utf8').match(/VERCEL_TOKEN=(.+)/)[1];
  require('child_process').execSync('npx vercel whoami --token ' + token, {stdio:'inherit'});
"

# List deployments
# (use token from .env.local — see scripts/deploy.mjs pattern)

# Open project on Vercel dashboard
start https://vercel.com/nextgen-pickleball/nextgen-pickleball

# Run dev server locally
npm run dev
```
