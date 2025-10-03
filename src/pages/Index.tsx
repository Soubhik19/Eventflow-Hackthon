import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, CheckCircle, Upload, Zap, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Automation",
      description: "Automated name validation and certificate generation at scale",
    },
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "Immutable authenticity proof on Ethereum blockchain",
    },
    {
      icon: Upload,
      title: "Bulk Processing",
      description: "Upload CSV and generate thousands of certificates instantly",
    },
    {
      icon: Clock,
      title: "Instant Delivery",
      description: "Automated email delivery with QR codes for verification",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE0ek0zNiAyOHYySDE0di0yaDIyem0wLTZ2Mkgy0HYtMmgyMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur rounded-full">
                <Award className="h-16 w-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              EventFlow
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              AI-Powered Certificate Automation System
            </p>
            
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Generate, verify, and deliver digital certificates at scale with blockchain-backed authenticity
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20"
                onClick={() => navigate("/verify")}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Verify Certificate
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose EventFlow?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that make certificate management effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to automate your certificate workflow
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "1",
                title: "Create Event",
                description: "Set up your event with title, date, and description",
              },
              {
                step: "2",
                title: "Upload Participants",
                description: "Upload CSV with participant names and emails",
              },
              {
                step: "3",
                title: "Generate Certificates",
                description: "Automated generation with QR codes and blockchain verification",
              },
              {
                step: "4",
                title: "Deliver & Verify",
                description: "Bulk email delivery with instant verification portal",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex gap-6 items-start p-6 bg-background rounded-lg shadow-sm"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Automate Your Certificates?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join EventFlow today and experience seamless certificate management
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold"
            onClick={() => navigate("/auth")}
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 EventFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
