import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Copy, ExternalLink, Mail, Settings } from 'lucide-react';

const EmailSetupGuide = () => {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [showEnv, setShowEnv] = useState(false);

  const generateEnvConfig = () => {
    return `# Add these to your .env file
VITE_EMAILJS_SERVICE_ID=${serviceId}
VITE_EMAILJS_TEMPLATE_ID=${templateId}
VITE_EMAILJS_PUBLIC_KEY=${publicKey}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const emailTemplate = `
Hello {{participant_name}},

Congratulations on successfully completing {{event_title}}!

Your certificate has been generated with the following details:
- Certificate ID: {{certificate_id}}
- Event: {{event_title}}
- Verification URL: {{verification_url}}

You can verify your certificate anytime using the QR code or the verification link above.

Best regards,
EventFlow Team
  `;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            📧 Email Setup Guide
          </CardTitle>
          <CardDescription>
            Configure EmailJS to send certificates to participants automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 1: Create EmailJS Account</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Visit <Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://www.emailjs.com/')}>
                  https://www.emailjs.com/ <ExternalLink className="h-3 w-3 ml-1" />
                </Button></li>
                <li>Sign up for a free account</li>
                <li>Verify your email address</li>
              </ol>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 2: Add Email Service</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to EmailJS Dashboard → Email Services</li>
                <li>Click "Add New Service"</li>
                <li>Choose your email provider (Gmail, Outlook, etc.)</li>
                <li>Follow the setup instructions</li>
                <li>Copy your <strong>Service ID</strong></li>
              </ol>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 3: Create Email Template</h3>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to EmailJS Dashboard → Email Templates</li>
                <li>Click "Create New Template"</li>
                <li>Set template name: "Certificate Notification"</li>
                <li>Use this template content:</li>
              </ol>
              <div className="mt-3 p-3 bg-white border rounded text-xs font-mono">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-600">Template Content:</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => copyToClipboard(emailTemplate)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap">{emailTemplate}</pre>
              </div>
              <p className="text-sm mt-2">5. Save template and copy your <strong>Template ID</strong></p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 4: Get Public Key</h3>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to EmailJS Dashboard → Account</li>
                <li>Find "Public Key" section</li>
                <li>Copy your <strong>Public Key</strong></li>
              </ol>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 5: Configure Application</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  placeholder="e.g., service_abc123"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="templateId">Template ID</Label>
                <Input
                  id="templateId"
                  placeholder="e.g., template_xyz789"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="publicKey">Public Key</Label>
                <Input
                  id="publicKey"
                  placeholder="e.g., abcDEF123xyz"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                />
              </div>
            </div>

            {serviceId && templateId && publicKey && (
              <div className="space-y-3">
                <Button onClick={() => setShowEnv(!showEnv)} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  {showEnv ? 'Hide' : 'Show'} Environment Configuration
                </Button>
                
                {showEnv && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Add to your .env file:</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard(generateEnvConfig())}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <pre className="text-sm font-mono bg-white p-3 rounded border">
                      {generateEnvConfig()}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Status */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Status:</strong> Email functionality will use mailto fallback until EmailJS is configured.
              This will open the user's default email client with pre-filled content.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSetupGuide;