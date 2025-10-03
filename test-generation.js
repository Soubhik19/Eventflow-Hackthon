// Quick test of certificate generation
import { generateCertificatePDF, generateQRCode } from './src/lib/certificateGenerator.js';

console.log('Testing certificate generation...');

// Test QR code generation
try {
  const qrCode = await generateQRCode('test-verification-url');
  console.log('✅ QR Code generation successful');
} catch (error) {
  console.error('❌ QR Code generation failed:', error);
}

// Test PDF generation
try {
  const pdf = await generateCertificatePDF({
    participantName: 'Test User',
    eventTitle: 'Test Event',
    eventDate: '2024-01-15',
    certificateHash: 'test-hash-123',
    qrCodeDataUrl: 'data:image/png;base64,test'
  });
  console.log('✅ PDF generation successful');
} catch (error) {
  console.error('❌ PDF generation failed:', error);
}