// Quick database fix for RLS policy
import { supabase } from './src/integrations/supabase/client.js';

console.log('🔧 Applying database fix for certificate insert permissions...');

// This will add the missing INSERT policy for certificates
const sql = `
CREATE POLICY IF NOT EXISTS "Organizers can insert certificates for their events"
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
`;

try {
  const { data, error } = await supabase.rpc('exec', { sql });
  if (error) {
    console.error('❌ Error applying fix:', error);
  } else {
    console.log('✅ Database permissions fixed!');
  }
} catch (err) {
  console.error('❌ Failed to apply fix:', err);
  console.log('📝 Please run this SQL manually in Supabase Dashboard:');
  console.log(sql);
}