import React from 'react';

const CertificateTestComponent = () => {
  const runQuickTest = async () => {
    try {
      console.log('🧪 Testing certificate generation components...');
      
      // Test 1: Simple hash generation
      const testString = 'test-participant-data';
      const hash1 = btoa(testString + Date.now()).substring(0, 16);
      console.log('✅ Hash generation 1:', hash1);
      
      // Test 2: Alternative hash
      const hash2 = Array.from(testString).reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
      }, 0).toString(36);
      console.log('✅ Hash generation 2:', hash2);
      
      // Test 3: QR Code library
      if (typeof QRCode !== 'undefined') {
        console.log('✅ QRCode library available');
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, 'test-verification-url');
        console.log('✅ QR Code generation successful');
      } else {
        console.log('⚠️ QRCode library not available in this context');
      }
      
      // Test 4: jsPDF
      if (typeof window !== 'undefined' && window.jsPDF) {
        console.log('✅ jsPDF library available');
        const pdf = new window.jsPDF();
        pdf.text('Test PDF', 10, 10);
        console.log('✅ PDF generation successful');
      } else {
        console.log('⚠️ jsPDF library not available in this context');
      }
      
      console.log('🎉 All tests completed!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🧪 Certificate Generation Test</h2>
      <button 
        onClick={runQuickTest}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Quick Test
      </button>
      <div className="mt-4 text-sm text-gray-600">
        <p>This will test:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Hash generation (crypto-js replacement)</li>
          <li>QR Code library</li>
          <li>jsPDF library</li>
          <li>Basic certificate components</li>
        </ul>
        <p className="mt-2 text-xs">Check browser console for results.</p>
      </div>
    </div>
  );
};

export default CertificateTestComponent;