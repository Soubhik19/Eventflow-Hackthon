import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download, TestTube } from "lucide-react";

const SimpleTest = () => {
  const [isTestingPDF, setIsTestingPDF] = useState(false);
  const [isTestingQR, setIsTestingQR] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const testPDFGeneration = async () => {
    setIsTestingPDF(true);
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Test PDF Generation', 20, 20);
      pdf.setFontSize(12);
      pdf.text('This is a simple test to verify jsPDF is working correctly.', 20, 40);
      pdf.text('If you can see this, PDF generation is working!', 20, 60);
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      toast({
        title: "✅ PDF Test Successful",
        description: "PDF generation is working correctly",
      });
    } catch (error) {
      console.error('PDF test error:', error);
      toast({
        title: "❌ PDF Test Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingPDF(false);
    }
  };

  const testQRGeneration = async () => {
    setIsTestingQR(true);
    try {
      const qrDataUrl = await QRCode.toDataURL('https://example.com/test', {
        width: 200,
        margin: 2
      });
      setQrUrl(qrDataUrl);
      
      toast({
        title: "✅ QR Code Test Successful",
        description: "QR code generation is working correctly",
      });
    } catch (error) {
      console.error('QR test error:', error);
      toast({
        title: "❌ QR Code Test Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingQR(false);
    }
  };

  const downloadTestPDF = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "test.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="border-2 border-yellow-200">
      <CardHeader className="bg-yellow-50">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <TestTube className="h-5 w-5" />
          Library Test Suite
        </CardTitle>
        <CardDescription className="text-yellow-600">
          Test if the certificate generation libraries are working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* PDF Test */}
          <div className="space-y-3">
            <h4 className="font-semibold">PDF Generation Test</h4>
            <Button 
              onClick={testPDFGeneration}
              disabled={isTestingPDF}
              className="w-full"
              variant="outline"
            >
              {isTestingPDF ? "Testing..." : "Test PDF"}
            </Button>
            {pdfUrl && (
              <Button 
                onClick={downloadTestPDF}
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Test PDF
              </Button>
            )}
          </div>

          {/* QR Test */}
          <div className="space-y-3">
            <h4 className="font-semibold">QR Code Test</h4>
            <Button 
              onClick={testQRGeneration}
              disabled={isTestingQR}
              className="w-full"
              variant="outline"
            >
              {isTestingQR ? "Testing..." : "Test QR Code"}
            </Button>
            {qrUrl && (
              <div className="text-center">
                <img src={qrUrl} alt="Test QR Code" className="mx-auto border rounded" />
                <p className="text-xs text-green-600 mt-1">✅ QR Code Generated</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            🔧 <strong>Troubleshooting:</strong> If tests fail, check browser console for detailed error messages
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleTest;