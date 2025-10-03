import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, ExternalLink, Mail, Settings, CheckCircle, AlertCircle } from 'lucide-react';

const EmailJSQuickSetup = () => {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateEnvConfig = () => {
    return `# Add these lines to your .env file for automated email sending
VITE_EMAILJS_SERVICE_ID=${serviceId || 'your_service_id_here'}
VITE_EMAILJS_TEMPLATE_ID=${templateId || 'your_template_id_here'}
VITE_EMAILJS_PUBLIC_KEY=${publicKey || 'your_public_key_here'}`;
  };

  const isConfigured = 
    import.meta.env.VITE_EMAILJS_SERVICE_ID && 
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY &&
    import.meta.env.VITE_EMAILJS_SERVICE_ID !== 'your_service_id' &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID !== 'your_template_id' &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY !== 'your_public_key';

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Mail className="h-5 w-5" />
          {isConfigured ? '✅ Automated Email Setup' : '⚙️ Email Automation Setup'}
        </CardTitle>
        <CardDescription className="text-blue-600">
          {isConfigured 
            ? 'EmailJS is configured! Emails will be sent automatically.' 
            : 'Set up EmailJS to automatically send personalized certificates to all participants at once'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isConfigured ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 EmailJS is properly configured! When you click "Send Automated Emails", the system will automatically send personalized emails to all participants without requiring manual clicks.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                📧 Ready to set up automated emails with your Gmail account: <strong>soubhiksamanta25@gmail.com</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Gmail Setup (5 minutes):</h3>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Step 1: Create EmailJS Account</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open('https://www.emailjs.com/', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Go to EmailJS.com
                  </Button>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Step 2: Connect Gmail Service</h4>
                  <p className="text-sm text-gray-600">Connect your Gmail account: <strong>soubhiksamanta25@gmail.com</strong></p>
                  <p className="text-xs text-gray-500 mt-1">This will be the "From" address for all certificate emails</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Step 3: Create Email Template</h4>
                  <p className="text-sm text-gray-600 mb-2">In EmailJS, create a template with this content:</p>
                  
                  <div className="bg-white p-3 rounded border text-xs space-y-2">
                    <div><strong>Subject:</strong> <code>{'{{subject}}'}</code></div>
                    <div><strong>To:</strong> <code>{'{{to_email}}'}</code></div>
                    <div><strong>From Name:</strong> <code>{'{{from_name}}'}</code></div>
                    <div><strong>Reply To:</strong> <code>{'{{reply_to}}'}</code></div>
                  </div>
                  
                  <div className="mt-2 text-xs">
                    <p className="font-medium mb-1">Email Body Template:</p>
                    <div className="bg-white p-2 rounded border font-mono text-xs whitespace-pre-wrap">{`Dear {{to_name}},

Congratulations on completing {{event_name}}!

Your certificate details:
• Certificate ID: {{certificate_id}}
• Verification URL: {{verification_url}}

Best regards,
{{from_name}}`}</div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    <p><strong>Required variables:</strong> to_name, to_email, from_name, subject, event_name, certificate_id, verification_url, reply_to</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Step 4: Get Your Configuration</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="serviceId" className="text-sm">Service ID</Label>
                      <Input
                        id="serviceId"
                        placeholder="service_abc123"
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateId" className="text-sm">Template ID</Label>
                      <Input
                        id="templateId"
                        placeholder="template_xyz456"
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="publicKey" className="text-sm">Public Key</Label>
                      <Input
                        id="publicKey"
                        placeholder="12345abcdef"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm mb-2 text-green-800">Step 5: Add to .env file</h4>
                  <div className="bg-white p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                    {generateEnvConfig()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateEnvConfig())}
                    className="mt-2 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy Config'}
                  </Button>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    💡 After adding the configuration to your .env file, restart the development server (npm run dev) and the system will automatically send emails to all participants!
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailJSQuickSetup;