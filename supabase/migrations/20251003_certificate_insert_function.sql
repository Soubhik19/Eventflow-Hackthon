-- Function to insert certificates with elevated permissions
CREATE OR REPLACE FUNCTION public.insert_event_certificates(
  p_event_id UUID,
  p_certificates JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cert JSONB;
BEGIN
  -- Verify the user owns the event
  IF NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = p_event_id
    AND organizer_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to insert certificates for this event';
  END IF;

  -- Insert each certificate
  FOR cert IN SELECT * FROM jsonb_array_elements(p_certificates)
  LOOP
    INSERT INTO public.certificates (
      participant_id,
      event_id,
      certificate_hash,
      qr_code_data,
      status,
      generated_at
    )
    VALUES (
      (cert->>'participant_id')::UUID,
      p_event_id,
      cert->>'certificate_hash',
      cert->>'qr_code_data',
      cert->>'status',
      (cert->>'generated_at')::TIMESTAMPTZ
    );
  END LOOP;
END;
$$;