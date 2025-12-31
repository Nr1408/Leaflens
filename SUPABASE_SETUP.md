Supabase setup for LeafLens (Auth-only mode)

1) In `app.json` under `expo.extra`, set:

- SUPABASE_URL: https://YOUR_PROJECT_REF.supabase.co
- SUPABASE_ANON_KEY: YOUR_SUPABASE_ANON_KEY

2) Create an RPC to resolve username → email using only auth.users (no public tables)

Paste this in the SQL Editor:

```
-- Case-insensitive lookup on user_metadata.username or email local-part
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from auth.users u
  where
    lower(coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1))) = lower(p_username)
  limit 1;
$$;

-- Allow anonymous callers to use this (only returns an email string, no other data)
revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;
```

3) Reload Expo after updating `app.json` or SQL.
