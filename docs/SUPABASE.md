## Supabase configuration (required)

This application requires a Supabase project to provide live data. The application will not use any mock data when Supabase is missing or unreachable.

Required environment variables (set locally or as GitHub repository secrets):

- NEXT_PUBLIC_SUPABASE_URL — your Supabase project URL (example: `https://xyzcompany.supabase.co`)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — your Supabase anon/public key

Local development (Linux/macOS):

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
npm run dev
```

Local development (Windows PowerShell):

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key"
npm run dev
```

GitHub Actions / Repository secrets:

1. Go to your repository Settings → Secrets and variables → Actions → New repository secret.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with their values.

Runtime behavior enforced by policy:

- If the required env vars are missing or Supabase queries fail or return zero rows, the app will display a consistent "Live data unavailable" UI.
- The app will NOT fall back to any mock data.

---

Notes:
- Do NOT commit any secrets/keys. The code reads env vars at runtime.
- Branch already exists; commit should be made to remove-mocks/batch-1.
