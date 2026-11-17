-- Evaluate auth.uid() once per statement for better RLS performance.
drop policy if exists "Users can read their own website projects" on public.website_projects;
create policy "Users can read their own website projects" on public.website_projects for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own website projects" on public.website_projects;
create policy "Users can create their own website projects" on public.website_projects for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own website projects" on public.website_projects;
create policy "Users can update their own website projects" on public.website_projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own website projects" on public.website_projects;
create policy "Users can delete their own website projects" on public.website_projects for delete to authenticated using ((select auth.uid()) = user_id);
