-- Reliable email lookup for auth users
-- admin.listUsers({ filter }) is broken and ignores the filter,
-- so we query auth.users directly via an RPC function.
create or replace function get_user_id_by_email(lookup_email text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select id from auth.users where email = lower(lookup_email) limit 1;
$$;

-- Restrict to service_role only — this is a server-side operation
revoke execute on function get_user_id_by_email(text) from anon, authenticated;
