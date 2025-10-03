import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bug, Play, Mail, AlertTriangle } from "lucide-react";

interface DebugCertificateProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  participantCount: number;
}

const DebugCertificate = ({ 
  eventId, 
  eventTitle, 
  eventDate, 
  participantCount 
}: DebugCertificateProps) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const debugCertificateGeneration = async () => {
    setIsDebugging(true);
    setDebugLog([]);
    
    try {
      addLog("🚀 Starting debug certificate generation");
      addLog(`📊 Event: ${eventTitle}, Participants: ${participantCount}`);
      
      // Step 1: Test participant fetch
      addLog("📋 Fetching participants from database...");
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("id, name, email")
        .eq("event_id", eventId);

      if (participantsError) {
        addLog(`❌ Participant fetch error: ${participantsError.message}`);
        throw new Error(`Database error: ${participantsError.message}`);
      }

      if (!participants || participants.length === 0) {
        addLog("⚠️ No participants found in database");
        throw new Error("No participants found");
      }

      addLog(`✅ Found ${participants.length} participants`);
      participants.forEach((p, i) => {
        addLog(`   ${i + 1}. ${p.name} (${p.email})`);
      });

      // Step 2: Test email functionality
      addLog("📧 Testing email functionality...");
      const testParticipant = participants[0];
      const subject = `Test Certificate - ${eventTitle}`;
      const body = `Dear ${testParticipant.name},

This is a test email for the certificate system.

Certificate ID: TEST123
Event: ${eventTitle}
Verification URL: ${window.location.origin}/verify?id=test

Best regards,
EventFlow Team`;

      const mailtoLink = `mailto:${testParticipant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      addLog(`📬 Generated mailto link for ${testParticipant.name}`);
      addLog(`📎 Attempting to open email client...`);
      
      try {
        window.open(mailtoLink);
        addLog(`✅ Email client opened successfully`);
      } catch (emailError) {
        addLog(`❌ Failed to open email client: ${emailError.message}`);
      }

      // Step 3: Test QR code generation
      addLog("🔳 Testing QR code generation...");
      try {
        const QRCode = (await import('qrcode')).default;
        const testUrl = `${window.location.origin}/verify?id=test123`;
        const qrData = await QRCode.toDataURL(testUrl);
        addLog(`✅ QR code generated (${qrData.length} characters)`);
      } catch (qrError) {
        addLog(`❌ QR code generation failed: ${qrError.message}`);
        throw qrError;
      }
        throw new Error("No participants found. Please upload participants first.");
      }

      addLog(`✅ Found ${participants.length} participants`);
      participants.forEach((p, i) => {
        addLog(`   ${i + 1}. ${p.name} (${p.email})`);
      });

      // Step 2: Test hash generation
      addLog("🔐 Testing certificate hash generation...");
      const testParticipant = participants[0];
      const timestamp = new Date().toISOString();
      
      // Simple hash generation (without crypto-js)
      const hashData = `${testParticipant.id}-${eventId}-${timestamp}`;
      const simpleHash = btoa(hashData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      addLog(`✅ Generated hash: ${simpleHash}`);

      // Step 3: Test QR code generation
      addLog("📱 Testing QR code generation...");
      try {
        const QRCode = (await import('qrcode')).default;
        const verificationUrl = `${window.location.origin}/verify?id=${simpleHash}`;
        const qrDataUrl = await QRCode.toDataURL(verificationUrl);
        addLog(`✅ QR code generated successfully (${qrDataUrl.length} chars)`);
      } catch (qrError) {
        addLog(`❌ QR code generation failed: ${qrError.message}`);
        throw qrError;
      }

      // Step 4: Test PDF generation
      addLog("📄 Testing PDF generation...");
      try {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF();
        pdf.text('Test Certificate', 20, 20);
        const blob = pdf.output('blob');
        addLog(`✅ PDF generated successfully (${blob.size} bytes)`);
      } catch (pdfError) {
        addLog(`❌ PDF generation failed: ${pdfError.message}`);
        throw pdfError;
      }

      addLog("🎉 All tests passed! Certificate generation should work.");
      
      toast({
        title: "✅ Debug Complete",
        description: "All components are working correctly",
      });

    } catch (error) {
      addLog(`💥 Fatal error: ${error.message}`);
      toast({
        title: "❌ Debug Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-purple-50">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Bug className="h-5 w-5" />
          Certificate Debug Tool
        </CardTitle>
        <CardDescription className="text-purple-600">
          Debug certificate generation step by step
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <Button 
          onClick={debugCertificateGeneration}
          disabled={isDebugging}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isDebugging ? (
            "🔍 Debugging..."
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Debug Test
            </>
          )}
        </Button>

        {debugLog.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono max-h-60 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugCertificate;