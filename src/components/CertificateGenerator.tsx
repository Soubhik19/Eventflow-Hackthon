import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateEventCertificates } from "@/lib/certificateGenerator";
import { sendBulkCertificateEmails } from "@/lib/emailService";
import { Award, Download, CheckCircle, Users, FileText, Mail } from "lucide-react";
import JSZip from "jszip";

interface CertificateGeneratorProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  participantCount: number;
}

const CertificateGenerator = ({ 
  eventId, 
  eventTitle, 
  eventDate, 
  participantCount 
}: CertificateGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [emailProgress, setEmailProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [certificatesGenerated, setCertificatesGenerated] = useState(false);
  const [participantData, setParticipantData] = useState<Array<{ name: string; email: string; certificateHash: string }>>([]);
  const { toast } = useToast();

  const handleGenerateCertificates = async () => {
    if (participantCount === 0) {
      toast({
        title: "No participants found",
        description: "Please upload participants first using the 'Upload CSV' tab",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setDownloadUrl(null);
    setCertificatesGenerated(false);

    try {
      toast({
        title: "Starting certificate generation...",
        description: `Generating certificates for ${participantCount} participants`,
      });

      // Fetch participants
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("id, name, email")
        .eq("event_id", eventId);

      if (participantsError || !participants || participants.length === 0) {
        console.error("Participants error:", participantsError);
        throw new Error("Failed to fetch participants or no participants found");
      }

      console.log('Fetched participants:', participants);
      console.log('Sample participant:', participants[0]);

      toast({
        title: "Participants loaded",
        description: `Found ${participants.length} participants`,
      });

      // Generate certificates
      const certificates = await generateEventCertificates(
        participants,
        { id: eventId, title: eventTitle, event_date: eventDate },
        (progressValue) => {
          setProgress(progressValue);
          toast({
            title: "Generating certificates...",
            description: `Progress: ${progressValue}%`,
          });
        }
      );

      // Save certificates to database
      const certificateRecords = certificates.map(cert => ({
        participant_id: cert.participantId,
        event_id: eventId,
        certificate_hash: cert.certificateHash,
        qr_code_data: cert.qrCodeData,
        status: 'generated' as const,
        generated_at: new Date().toISOString()
      }));

      console.log('Certificate records to insert:', certificateRecords);
      console.log('Sample certificate record:', certificateRecords[0]);

      // First, delete any existing certificates for this event to avoid conflicts
      const { error: deleteError } = await supabase
        .from("certificates")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) {
        console.warn("Could not delete existing certificates:", deleteError);
        // Continue anyway, might be first time generating
      }

      const { error: insertError } = await supabase
        .from("certificates")
        .insert(certificateRecords);

      if (insertError) {
        console.error("Database insert error:", insertError);
        console.error("Error details:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        console.error("Certificate records that failed:", certificateRecords);
        throw new Error(`Failed to save certificates to database: ${insertError.message}`);
      }

      // Create ZIP file with all certificates
      const zip = new JSZip();
      
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        const participant = participants[i];
        const filename = `${participant.name.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
        zip.file(filename, cert.pdfBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
      setGeneratedCount(certificates.length);
      setCertificatesGenerated(true);

      // Store participant data for email sending
      const participantEmailData = participants.map((p, i) => ({
        name: p.name,
        email: p.email,
        certificateHash: certificates[i].certificateHash
      }));
      setParticipantData(participantEmailData);

      toast({
        title: "✅ Success!",
        description: `Generated ${certificates.length} certificates with QR codes`,
      });

    } catch (error) {
      console.error("Error generating certificates:", error);
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate certificates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificates.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your certificates ZIP file is downloading",
      });
    }
  };

  const handleSendEmails = async () => {
    if (participantData.length === 0) {
      toast({
        title: "⚠️ No Data",
        description: "Please generate certificates first before sending emails.",
        variant: "destructive",
      });
      return;
    }

    setIsEmailSending(true);
    setEmailProgress(0);

    try {
      const result = await sendBulkCertificateEmails(
        participantData,
        eventTitle,
        (progress) => setEmailProgress(progress)
      );

      toast({
        title: "📧 Email Preparation Complete",
        description: `Emails prepared for ${result.success} participants. ${result.failed > 0 ? `${result.failed} failed.` : 'Check your email client!'}`,
      });

      if (result.success > 0) {
        // Show instructions for email sending
        toast({
          title: "📬 Email Instructions",
          description: "Your email client will open with either: 1) One email to all participants (BCC), or 2) Individual emails. Choose your preferred option in the dialog.",
          duration: 8000,
        });
      }

    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "❌ Email Failed",
        description: "Failed to prepare emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Award className="h-5 w-5" />
          Certificate Generator
        </CardTitle>
        <CardDescription className="text-green-600">
          Generate professional certificates with QR codes for all participants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Participants</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{participantCount}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Certificates</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{generatedCount}</div>
          </div>
        </div>

        {/* Generation Section */}
        {!isGenerating && !downloadUrl && (
          <div className="text-center py-8 space-y-4">
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <Award className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Ready to Generate Certificates</h3>
              <p className="text-yellow-700 mb-4">
                This will create {participantCount} professional certificates with unique QR codes for verification
              </p>
              
              {participantCount === 0 ? (
                <div className="space-y-2">
                  <p className="text-red-600 font-medium">⚠️ No participants found</p>
                  <p className="text-sm text-red-500">Please upload participants using the 'Upload CSV' tab first</p>
                </div>
              ) : (
                <Button 
                  onClick={handleGenerateCertificates}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Award className="mr-2 h-5 w-5" />
                  Generate {participantCount} Certificates
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Progress Section */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="text-lg font-medium text-blue-800 mb-2">Generating Certificates...</div>
              <div className="text-blue-600 mb-4">
                Creating professional certificates with QR codes
              </div>
              <Progress value={progress} className="w-full h-3 mb-4" />
              <div className="text-sm text-blue-700 font-medium">
                {progress}% complete • Processing {participantCount} certificates
              </div>
            </div>
          </div>
        )}

        {/* Success Section */}
        {downloadUrl && certificatesGenerated && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-3 text-green-700 mb-4">
                <CheckCircle className="h-8 w-8" />
                <span className="text-xl font-semibold">
                  🎉 {generatedCount} Certificates Generated Successfully!
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✅ What's included:</h4>
                  <ul className="text-sm text-green-700 space-y-1 text-left max-w-md mx-auto">
                    <li>• Professional certificate design</li>
                    <li>• Unique QR code for each certificate</li>
                    <li>• Individual PDF files in ZIP format</li>
                    <li>• Verification system integrated</li>
                    <li>• Database records saved</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleDownload} 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download All Certificates (ZIP)
                </Button>
                
                {/* Email Section */}
                <div className="border-t border-green-200 pt-4">
                  <h4 className="font-semibold text-green-800 mb-3">📧 Send to Participants</h4>
                  
                  {isEmailSending ? (
                    <div className="space-y-3">
                      <div className="text-sm text-green-700">Preparing emails for participants...</div>
                      <Progress value={emailProgress} className="w-full h-3" />
                      <div className="text-xs text-green-600">{emailProgress}% complete</div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleSendEmails}
                      variant="outline"
                      size="lg" 
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      disabled={participantData.length === 0}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      📧 Email All Participants ({participantData.length} recipients)
                    </Button>
                  )}
                  
                  <p className="text-xs text-green-600 mt-2">
                    Choose: Send one email to all (BCC) or individual emails to each participant
                  </p>
                </div>
                
                <p className="text-sm text-green-600">
                  Each certificate includes a unique QR code that links to the verification page
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;