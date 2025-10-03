-- Fix certificate insert permissions
-- Run this in Supabase SQL Editor

CREATE POLICY "Organizers can insert certificates for their events"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = certificates.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'certificates';