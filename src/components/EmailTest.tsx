import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Mail, AlertTriangle } from "lucide-react";

const EmailTest = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Check EmailJS configuration
  const emailJSConfig = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  };

  const isConfigured = 
    emailJSConfig.serviceId && 
    emailJSConfig.templateId && 
    emailJSConfig.publicKey &&
    emailJSConfig.serviceId !== 'your_service_id_here' &&
    emailJSConfig.templateId !== 'your_template_id_here' &&
    emailJSConfig.publicKey !== 'your_public_key_here';

  const testEmailConfiguration = async () => {
    setIsLoading(true);
    setTestResult("Testing email configuration...");

    try {
      // Check if EmailJS is available
      const emailjs = await import('@emailjs/browser');
      
      if (!isConfigured) {
        setTestResult("❌ EmailJS not configured. Emails will open as drafts in your email client.");
        setIsLoading(false);
        return;
      }

      // Initialize EmailJS
      emailjs.default.init(emailJSConfig.publicKey);
      
      // Test parameters
      const testParams = {
        to_name: "Test User",
        to_email: "test@example.com",
        from_name: "EventFlow Team",
        subject: "Test Email Configuration",
        event_name: "Test Event",
        certificate_id: "TEST123",
        verification_url: "https://example.com/verify",
        reply_to: "noreply@eventflow.com"
      };

      console.log("🧪 Testing EmailJS with config:", {
        serviceId: emailJSConfig.serviceId,
        templateId: emailJSConfig.templateId,
        publicKey: emailJSConfig.publicKey ? 'SET' : 'NOT SET'
      });

      // Attempt to send test email
      const response = await emailjs.default.send(
        emailJSConfig.serviceId,
        emailJSConfig.templateId,
        testParams
      );

      console.log("✅ EmailJS Response:", response);
      setTestResult(`✅ EmailJS configured correctly! Test email sent successfully. Status: ${response.status}`);
      
    } catch (error: any) {
      console.error("❌ EmailJS Error:", error);
      
      let errorMessage = "❌ EmailJS Error: ";
      if (error.status === 400) {
        errorMessage += "Bad Request (400) - Check your template variables or Service/Template IDs";
      } else if (error.status === 401) {
        errorMessage += "Unauthorized (401) - Check your Public Key";
      } else if (error.status === 404) {
        errorMessage += "Not Found (404) - Check your Service ID or Template ID";
      } else {
        errorMessage += error.message || "Unknown error occurred";
      }
      
      setTestResult(errorMessage);
    }
    
    setIsLoading(false);
  };

  const testManualEmailDraft = () => {
    const subject = "Test Certificate - EventFlow";
    const body = `Dear Test User,

Congratulations on completing Test Event!

Your certificate details:
• Certificate ID: TEST123
• Verification URL: ${window.location.origin}/verify?id=test123

Best regards,
EventFlow Team`;
    
    const mailtoLink = `mailto:test@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    setTestResult("📝 Email draft opened in your default email client. This is how emails work when EmailJS is not configured.");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h3 className="font-semibold">Configuration Status:</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Service ID:</span>
              {emailJSConfig.serviceId ? (
                <Badge variant="secondary">{emailJSConfig.serviceId}</Badge>
              ) : (
                <Badge variant="destructive">Not Set</Badge>
              )}
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Template ID:</span>
              {emailJSConfig.templateId ? (
                <Badge variant="secondary">{emailJSConfig.templateId}</Badge>
              ) : (
                <Badge variant="destructive">Not Set</Badge>
              )}
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Public Key:</span>
              {emailJSConfig.publicKey ? (
                <Badge variant="secondary">Set</Badge>
              ) : (
                <Badge variant="destructive">Not Set</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="p-3 border rounded-lg">
          {isConfigured ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">EmailJS Configured - Automated emails enabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">EmailJS Not Configured - Manual email drafts mode</span>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={testEmailConfiguration}
            disabled={isLoading}
            className="w-full"
            variant={isConfigured ? "default" : "secondary"}
          >
            {isLoading ? "Testing..." : "Test EmailJS Configuration"}
          </Button>
          
          <Button 
            onClick={testManualEmailDraft}
            variant="outline"
            className="w-full"
          >
            Test Manual Email Draft (Always Works)
          </Button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="p-3 bg-gray-50 border rounded-lg">
            <h4 className="font-semibold mb-2">Test Result:</h4>
            <p className="text-sm whitespace-pre-wrap">{testResult}</p>
          </div>
        )}

        {/* Instructions */}
        {!isConfigured && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">How to Enable Automated Emails:</h4>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Go to <a href="https://emailjs.com" target="_blank" className="underline">EmailJS.com</a></li>
              <li>Create account with <strong>soubhiksamanta25@gmail.com</strong></li>
              <li>Add Gmail service and get Service ID</li>
              <li>Create email template and get Template ID</li>
              <li>Get your Public Key from Account settings</li>
              <li>Edit <code>.env.local</code> file and uncomment the lines</li>
              <li>Restart server: <code>npm run dev</code></li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTest;