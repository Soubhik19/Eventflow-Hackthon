import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Search, Award, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  valid: boolean;
  participant?: {
    name: string;
    email: string;
  };
  event?: {
    title: string;
    event_date: string;
  };
  verified_count?: number;
}

const Verify = () => {
  const [certificateId, setCertificateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data: certificate, error } = await supabase
        .from("certificates")
        .select(`
          *,
          participant:participants(name, email),
          event:events(title, event_date)
        `)
        .eq("certificate_hash", certificateId)
        .single();

      if (error || !certificate) {
        setResult({ valid: false });
        toast({
          title: "Certificate not found",
          description: "This certificate ID is not valid",
          variant: "destructive",
        });
      } else {
        // Increment verification count
        await supabase
          .from("certificates")
          .update({
            verified_count: certificate.verified_count + 1,
            last_verified_at: new Date().toISOString(),
            status: "verified",
          })
          .eq("id", certificate.id);

        setResult({
          valid: true,
          participant: certificate.participant,
          event: certificate.event,
          verified_count: certificate.verified_count + 1,
        });
        
        toast({
          title: "Certificate verified!",
          description: "This certificate is authentic",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-2xl space-y-6 animate-scale-in">
        <div className="text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 backdrop-blur rounded-full">
              <Award className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-white/80">
            Verify the authenticity of EventFlow certificates
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
            <CardDescription>
              Enter the certificate ID or scan the QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificate-id">Certificate ID</Label>
                <Input
                  id="certificate-id"
                  placeholder="Enter certificate hash..."
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.valid ? "border-accent" : "border-destructive"}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {result.valid ? (
                  <>
                    <div className="flex justify-center">
                      <div className="p-3 bg-accent/10 rounded-full">
                        <CheckCircle className="h-12 w-12 text-accent" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-accent mb-2">
                        Certificate Verified!
                      </h3>
                      <p className="text-muted-foreground">
                        This is an authentic EventFlow certificate
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 text-left mt-6">
                      <div className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Participant</span>
                        </div>
                        <p className="font-semibold">{result.participant?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.participant?.email}
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="h-4 w-4" />
                          <span>Event</span>
                        </div>
                        <p className="font-semibold">{result.event?.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(result.event?.event_date || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Verified {result.verified_count} time{result.verified_count !== 1 ? "s" : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <div className="p-3 bg-destructive/10 rounded-full">
                        <XCircle className="h-12 w-12 text-destructive" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-destructive mb-2">
                        Invalid Certificate
                      </h3>
                      <p className="text-muted-foreground">
                        This certificate ID could not be verified
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button
            variant="outline"
            className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20"
            onClick={() => window.location.href = "/"}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
