import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  certificateHash?: string;
  className?: string;
}

const QRCodeGenerator = ({ certificateHash, className }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [inputHash, setInputHash] = useState(certificateHash || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async (hash: string) => {
    if (!hash.trim()) return;
    
    setLoading(true);
    try {
      // Create verification URL
      const verificationUrl = `${window.location.origin}/verify?id=${hash}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateHash) {
      generateQRCode(certificateHash);
    }
  }, [certificateHash]);

  const handleGenerate = () => {
    generateQRCode(inputHash);
  };

  const copyToClipboard = () => {
    const verificationUrl = `${window.location.origin}/verify?id=${inputHash}`;
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: "Copied!",
      description: "Verification URL copied to clipboard",
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${inputHash.substring(0, 8)}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR codes for certificate verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!certificateHash && (
          <div className="space-y-2">
            <Label htmlFor="certificate-hash">Certificate Hash</Label>
            <div className="flex gap-2">
              <Input
                id="certificate-hash"
                placeholder="Enter certificate hash..."
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
              />
              <Button onClick={handleGenerate} disabled={loading || !inputHash.trim()}>
                Generate
              </Button>
            </div>
          </div>
        )}

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="border rounded-lg shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Verification URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/verify?id=${inputHash}`}
                  readOnly
                  className="text-sm"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                Download QR Code
              </Button>
              <Button onClick={() => generateQRCode(inputHash)} className="flex-1">
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;