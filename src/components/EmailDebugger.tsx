import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { testEmailJSConfiguration } from '@/lib/emailService';

const EmailDebugger = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testEmailJSConfiguration();
      setTestResult({
        success: result,
        message: result 
          ? 'EmailJS is configured correctly! You can now send automated emails.' 
          : 'EmailJS configuration failed. Check console for details.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  // Check current configuration
  const isConfigured = 
    import.meta.env.VITE_EMAILJS_SERVICE_ID && 
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY &&
    import.meta.env.VITE_EMAILJS_SERVICE_ID !== 'your_service_id' &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID !== 'your_template_id' &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY !== 'your_public_key';

  return (
    <Card className="border-2 border-yellow-200">
      <CardHeader className="bg-yellow-50">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <TestTube className="h-5 w-5" />
          🔧 EmailJS Debug & Test
        </CardTitle>
        <CardDescription className="text-yellow-600">
          Test your EmailJS configuration to fix the 400 error
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Current Configuration Status:</h3>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_EMAILJS_SERVICE_ID ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Service ID: {import.meta.env.VITE_EMAILJS_SERVICE_ID || 'Not set'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Template ID: {import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'Not set'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Public Key: {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'Set' : 'Not set'}</span>
            </div>
          </div>
        </div>

        {isConfigured ? (
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configuration detected! Click below to test if EmailJS can send emails with your current setup.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleTest}
              disabled={testing}
              className="w-full"
              variant="outline"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {testing ? 'Testing EmailJS...' : 'Test EmailJS Configuration'}
            </Button>
            
            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              EmailJS not configured. Add your EmailJS credentials to the .env file first.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm mb-2 text-blue-800">Common 400 Error Causes:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Template variables don't match (check template in EmailJS dashboard)</li>
            <li>• Wrong Service ID or Template ID</li>
            <li>• Email service not properly connected in EmailJS</li>
            <li>• Template not published or active</li>
            <li>• Rate limiting (free plan: 200 emails/month)</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-sm mb-2 text-green-800">Required Template Variables:</h4>
          <div className="text-xs text-green-700 font-mono">
            to_name, to_email, from_name, subject, event_name, certificate_id, verification_url, reply_to
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailDebugger;