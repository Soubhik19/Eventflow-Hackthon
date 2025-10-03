import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateData {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  organizerName?: string;
  certificateId: string;
}

// Generate a unique certificate hash (simplified version without crypto-js)
export const generateCertificateHash = (
  participantId: string,
  eventId: string,
  timestamp: string
): string => {
  try {
    // Add random component to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const data = `${participantId}-${eventId}-${timestamp}-${randomSuffix}`;
    
    // Use browser's built-in crypto API or fallback to simple encoding
    if (window.crypto && window.crypto.subtle) {
      // Use a simple hash based on participant ID and timestamp
      const hash = btoa(data).replace(/[^a-zA-Z0-9]/g, '');
      return hash.substring(0, 32);
    } else {
      // Fallback: simple encoding
      const hash = btoa(data).replace(/[^a-zA-Z0-9]/g, '');
      return hash.substring(0, 32);
    }
  } catch (error) {
    console.error('Error generating hash:', error);
    // Ultimate fallback
    const randomHash = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    return randomHash;
  }
};

// Generate QR code data URL
export const generateQRCode = async (certificateHash: string): Promise<string> => {
  try {
    // This should point to your verification URL
    const verificationUrl = `${window.location.origin}/verify?id=${certificateHash}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a fallback empty data URL if QR generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

// Generate PDF certificate with a clean, professional template
export const generateCertificatePDF = async (
  certificateData: CertificateData,
  qrCodeDataURL: string
): Promise<Blob> => {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Set up the certificate template
    pdf.setFont('helvetica');
    
    // Background - Clean white
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F');
    
    // Main border
    pdf.setDrawColor(34, 197, 94); // Green
    pdf.setLineWidth(2);
    pdf.rect(10, 10, 277, 190);
    
    // Inner border
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(1);
    pdf.rect(15, 15, 267, 180);
    
    // Title
    pdf.setFontSize(28);
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CERTIFICATE OF ACHIEVEMENT', 148.5, 50, { align: 'center' });
    
    // Decorative line under title
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(1);
    pdf.line(50, 60, 247, 60);

    // "This is to certify that" text
    pdf.setFontSize(14);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is to certify that', 148.5, 80, { align: 'center' });

    // Participant name - highlighted
    pdf.setFontSize(24);
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.participantName, 148.5, 100, { align: 'center' });

    // Achievement text
    pdf.setFontSize(14);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'normal');
    pdf.text('has successfully completed', 148.5, 120, { align: 'center' });

    // Event title
    pdf.setFontSize(18);
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.eventTitle, 148.5, 140, { align: 'center' });

    // Event date
    pdf.setFontSize(12);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'normal');
    const formattedDate = new Date(certificateData.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Date: ${formattedDate}`, 148.5, 155, { align: 'center' });

    // Add QR Code
    if (qrCodeDataURL) {
      const qrSize = 25;
      pdf.addImage(qrCodeDataURL, 'PNG', 25, 160, qrSize, qrSize);
      
      // QR Code info
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Scan to verify', 37.5, 190, { align: 'center' });
    }

    // Certificate ID
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Certificate ID: ${certificateData.certificateId}`, 148.5, 175, { align: 'center' });

    // Signature section
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(1);
    pdf.line(200, 165, 260, 165);
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text('Authorized Signature', 230, 175, { align: 'center' });

    // Footer branding
    pdf.setFontSize(8);
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Powered by EventFlow', 148.5, 195, { align: 'center' });

    return pdf.output('blob');
  } catch (error) {
    console.error('Error in generateCertificatePDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Generate multiple certificates for an event
export const generateEventCertificates = async (
  participants: Array<{ id: string; name: string; email: string }>,
  eventData: { id: string; title: string; event_date: string },
  onProgress?: (progress: number) => void
): Promise<Array<{
  participantId: string;
  certificateHash: string;
  qrCodeData: string;
  pdfBlob: Blob;
}>> => {
  const certificates = [];
  const total = participants.length;

  if (total === 0) {
    throw new Error('No participants provided for certificate generation');
  }

  for (let i = 0; i < participants.length; i++) {
    try {
      const participant = participants[i];
      
      if (!participant.name || !participant.id) {
        console.warn(`Skipping participant ${i}: Missing name or ID`);
        continue;
      }

      const timestamp = new Date().toISOString();
      
      // Generate certificate hash
      const certificateHash = generateCertificateHash(
        participant.id,
        eventData.id,
        timestamp
      );
      
      // Generate QR code
      const qrCodeData = await generateQRCode(certificateHash);
      
      // Generate PDF
      const certificateData: CertificateData = {
        participantName: participant.name,
        eventTitle: eventData.title,
        eventDate: eventData.event_date,
        certificateId: certificateHash.substring(0, 8).toUpperCase()
      };
      
      const pdfBlob = await generateCertificatePDF(certificateData, qrCodeData);
      
      certificates.push({
        participantId: participant.id,
        certificateHash,
        qrCodeData,
        pdfBlob
      });
      
      // Report progress
      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
      
    } catch (error) {
      console.error(`Error generating certificate for participant ${i}:`, error);
      // Continue with other participants instead of failing completely
      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
    }
  }

  if (certificates.length === 0) {
    throw new Error('Failed to generate any certificates');
  }

  return certificates;
};