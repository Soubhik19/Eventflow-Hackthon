-- Add missing INSERT policy for certificates table
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