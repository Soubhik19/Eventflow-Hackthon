import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface DebugEmailProps {
  eventId: string;
}

const DebugEmail = ({ eventId }: DebugEmailProps) => {
  const [participants, setParticipants] = useState<Array<{ name: string; email: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("name, email")
        .eq("event_id", eventId);

      if (error) {
        console.error("Error fetching participants:", error);
        return;
      }

      setParticipants(data || []);
      console.log("📋 Debug - Participant emails:", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const testEmailVariables = () => {
    const testData = {
      to_email: "test@example.com",
      to_name: "Test User",
      from_name: "EventFlow Team",
      subject: "Test Subject",
      event_name: "Test Event",
      certificate_id: "TEST123",
      verification_url: "https://example.com/verify",
      reply_to: "noreply@eventflow.com"
    };

    console.log("🧪 Test Email Variables:", testData);
    alert(`Test Email Variables (check console):\n\n${JSON.stringify(testData, null, 2)}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🔍 Email Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Participants in Database:</h3>
          {loading ? (
            <p>Loading...</p>
          ) : participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="p-2 border rounded text-sm">
                  <strong>{p.name}</strong> → {p.email}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">❌ No participants found!</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">EmailJS Configuration:</h3>
          <div className="space-y-1 text-sm">
            <div>Service ID: {import.meta.env.VITE_EMAILJS_SERVICE_ID || "❌ Not set"}</div>
            <div>Template ID: {import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "❌ Not set"}</div>
            <div>Public Key: {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? "✅ Set" : "❌ Not set"}</div>
          </div>
        </div>

        <Button onClick={testEmailVariables} variant="outline">
          🧪 Test Email Variables
        </Button>

        <div className="bg-yellow-50 p-3 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">🔧 EmailJS Template Fix:</h4>
          <p className="text-sm text-yellow-700">
            If emails are going to your address only, check your EmailJS template:
          </p>
          <ul className="text-xs text-yellow-600 list-disc list-inside mt-1">
            <li><strong>To Email</strong> should be: <code>{`{{to_email}}`}</code></li>
            <li><strong>From Email</strong> should be: <code>soubhiksamanta25@gmail.com</code></li>
            <li><strong>Subject</strong> should be: <code>{`{{subject}}`}</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugEmail;