import { supabase } from './src/integrations/supabase/client.js';

// Temporary database fix script
// Run this in browser console if dashboard access is difficult

async function fixDatabase() {
  try {
    console.log('🔧 Attempting to fix database permissions...');
    
    // Try to create the missing policy
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (error) {
      console.error('❌ Error:', error);
      console.log('📝 Please use Supabase Dashboard method instead');
    } else {
      console.log('✅ Database permissions fixed!');
    }
  } catch (err) {
    console.error('❌ Fix failed:', err);
    console.log('📝 Please use Supabase Dashboard SQL Editor with this query:');
    console.log(`
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
    `);
  }
}

// Run the fix
fixDatabase();