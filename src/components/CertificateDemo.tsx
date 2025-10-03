import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateCertificatePDF, generateQRCode, generateCertificateHash } from "@/lib/certificateGenerator";
import { Award, Download, Eye } from "lucide-react";

const CertificateDemo = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateDemoCertificate = async () => {
    setIsGenerating(true);
    
    try {
      // Demo data
      const demoData = {
        participantName: "John Doe",
        eventTitle: "Web Development Workshop",
        eventDate: "2025-10-03",
        certificateId: "DEMO-001"
      };

      // Generate demo hash and QR code
      const hash = generateCertificateHash("demo-participant", "demo-event", new Date().toISOString());
      const qrCode = await generateQRCode(hash);
      
      // Generate PDF
      const pdfBlob = await generateCertificatePDF(demoData, qrCode);
      
      // Create download URL
      const url = URL.createObjectURL(pdfBlob);
      setDemoUrl(url);
      
      toast({
        title: "✅ Demo Certificate Generated!",
        description: "Your sample certificate is ready for preview",
      });
      
    } catch (error) {
      console.error("Error generating demo certificate:", error);
      toast({
        title: "❌ Error",
        description: "Failed to generate demo certificate",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDemo = () => {
    if (demoUrl) {
      const link = document.createElement("a");
      link.href = demoUrl;
      link.download = "Demo_Certificate.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Eye className="h-5 w-5" />
          Certificate Template Preview
        </CardTitle>
        <CardDescription className="text-blue-600">
          Generate a sample certificate to see the template design
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">📄 Template Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clean, professional design</li>
              <li>• Green color scheme</li>
              <li>• Participant name highlight</li>
              <li>• QR code for verification</li>
              <li>• Certificate ID for tracking</li>
            </ul>
          </div>
          
          {!demoUrl ? (
            <Button 
              onClick={generateDemoCertificate}
              disabled={isGenerating}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <Award className="mr-2 h-4 w-4" />
                  Generate Sample Certificate
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-green-600 font-medium">
                ✅ Sample certificate generated!
              </div>
              <Button 
                onClick={downloadDemo}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample Certificate
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateDemo;