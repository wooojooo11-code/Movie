drop policy if exists "Users can read own user lists" on public.user_lists;

create policy "Authenticated users can read own or shared user lists"
on public.user_lists
for select
to authenticated
using (auth.uid() = user_id or is_private = false);
