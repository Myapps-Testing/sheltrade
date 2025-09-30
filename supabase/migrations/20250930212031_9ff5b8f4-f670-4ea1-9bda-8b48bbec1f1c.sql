-- Drop the current public policy that allows all authenticated users to view bank details
DROP POLICY IF EXISTS "Authenticated users can view active bank details" ON public.sheltradeadmin_bankdetail;

-- Create admin-only policies for the bank details table
-- First, we need a way to identify admins. For now, we'll use a security definer function approach.

-- Create a secure function to get active bank details for deposit operations
CREATE OR REPLACE FUNCTION public.get_bank_details_for_deposit()
RETURNS TABLE (
  bank_name text,
  account_name text,
  account_number text,
  account_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return bank details if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Log access to bank details for audit purposes
  INSERT INTO public.bank_details_access_log (user_id, accessed_at)
  VALUES (auth.uid(), now())
  ON CONFLICT DO NOTHING;

  -- Return active bank details
  RETURN QUERY
  SELECT 
    bd.bank_name,
    bd.account_name,
    bd.account_number,
    bd.account_type
  FROM public.sheltradeadmin_bankdetail bd
  WHERE bd.is_active = true
  LIMIT 1;
END;
$$;

-- Create audit log table for tracking bank details access
CREATE TABLE IF NOT EXISTS public.bank_details_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, accessed_at)
);

-- Enable RLS on the audit log
ALTER TABLE public.bank_details_access_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own access logs
CREATE POLICY "Users can view their own access logs"
ON public.bank_details_access_log
FOR SELECT
USING (auth.uid() = user_id);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_bank_details_for_deposit() TO authenticated;