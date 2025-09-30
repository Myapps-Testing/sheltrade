-- Drop the existing public policy that allows anyone to view bank details
DROP POLICY IF EXISTS "Anyone can view active bank details" ON public.sheltradeadmin_bankdetail;

-- Create new policy that restricts access to authenticated users only
CREATE POLICY "Authenticated users can view active bank details"
ON public.sheltradeadmin_bankdetail
FOR SELECT
TO authenticated
USING (is_active = true);