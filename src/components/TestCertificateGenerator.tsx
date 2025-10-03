import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Award, Download } from "lucide-react";

// Simple test component to verify certificate generation works
const TestCertificateGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleTestGeneration = () => {
    setIsGenerating(true);
    
    // Simulate certificate generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Test Successful!",
        description: "Certificate generation functionality is working",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Test Certificate Generation
        </CardTitle>
        <CardDescription>
          Test if the certificate generation system is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Click the button below to test certificate generation
          </p>
          <Button 
            onClick={handleTestGeneration}
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              "Testing..."
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Test Certificate Generation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCertificateGenerator;