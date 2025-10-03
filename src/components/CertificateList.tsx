import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, Download, Mail } from 'lucide-react';

interface ParticipantCertificate {
  name: string;
  email: string;
  certificateHash: string;
  certificateId: string;
  verificationUrl: string;
}

interface CertificateListProps {
  participants: Array<{ name: string; email: string; certificateHash: string }>;
  eventTitle: string;
}

const CertificateList: React.FC<CertificateListProps> = ({ participants, eventTitle }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const certificates: ParticipantCertificate[] = participants.map(participant => ({
    name: participant.name,
    email: participant.email,
    certificateHash: participant.certificateHash,
    certificateId: participant.certificateHash.substring(0, 8).toUpperCase(),
    verificationUrl: `${window.location.origin}/verify?id=${participant.certificateHash}`
  }));

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendIndividualEmail = (certificate: ParticipantCertificate) => {
    const subject = `Your Certificate - ${eventTitle}`;
    const body = `
Dear ${certificate.name},

🎉 Congratulations on successfully completing ${eventTitle}!

Your certificate details:
📋 Certificate ID: ${certificate.certificateId}
🔗 Verification URL: ${certificate.verificationUrl}
📱 QR Code: Included in your PDF certificate

📥 To access your certificate:
1. Download the certificates ZIP file from the event page
2. Find your PDF certificate (${certificate.name}_Certificate.pdf)
3. Your certificate includes a unique QR code for verification

Best regards,
EventFlow Team
    `;
    
    const mailtoLink = `mailto:${certificate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 Generated Certificates
          <span className="text-sm font-normal text-gray-500">({certificates.length} certificates)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Each participant has a unique certificate with individual QR code and verification URL.
            You can copy details or send individual emails below.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {certificates.map((cert, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-green-800">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendIndividualEmail(cert)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Certificate ID:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{cert.certificateId}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(cert.certificateId, `id-${index}`)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {copiedId === `id-${index}` && (
                      <span className="text-green-600 text-xs">Copied!</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700">Verification URL:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs truncate flex-1">
                      {cert.verificationUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(cert.verificationUrl, `url-${index}`)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {copiedId === `url-${index}` && (
                      <span className="text-green-600 text-xs">Copied!</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                📱 QR Code: Embedded in PDF certificate • 🔍 Verification: Scan QR or use URL above
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>📥 Download:</strong> All certificates are in the ZIP file - individual PDFs named by participant</p>
            <p><strong>📱 QR Codes:</strong> Each PDF has a unique QR code that links to its verification URL</p>
            <p><strong>📧 Emails:</strong> Use individual "Email" buttons for personalized messages</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateList;