import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Users, Award } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import CSVUpload from "@/components/CSVUpload";
import ParticipantsList from "@/components/ParticipantsList";
import CertificateGenerator from "@/components/CertificateGenerator";
import TestCertificateGenerator from "@/components/TestCertificateGenerator";
import CertificateDemo from "@/components/CertificateDemo";
import SimpleTest from "@/components/SimpleTest";
import DebugCertificate from "@/components/DebugCertificate";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  status: string;
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    fetchEvent();
    fetchParticipantCount();
  }, [id]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load event",
        variant: "destructive",
      });
      navigate("/dashboard/events");
      return;
    }

    setEvent(data);
    setLoading(false);
  };

  const fetchParticipantCount = async () => {
    const { count } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id);
    
    setParticipantCount(count || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/events")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              {event.description || "No description"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === "active"
                ? "bg-accent/10 text-accent"
                : event.status === "completed"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {event.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Date</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(event.event_date), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participantCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{event.status}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants">
            <Users className="mr-2 h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="mr-2 h-4 w-4" />
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantsList eventId={id!} onUpdate={fetchParticipantCount} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <CSVUpload eventId={id!} onUploadComplete={() => {
            fetchParticipantCount();
            toast({
              title: "Success",
              description: "Participants uploaded successfully",
            });
          }} />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <DebugCertificate 
            eventId={id!}
            eventTitle={event.title}
            eventDate={event.event_date}
            participantCount={participantCount}
          />
          <SimpleTest />
          <CertificateDemo />
          <CertificateGenerator 
            eventId={id!}
            eventTitle={event.title}
            eventDate={event.event_date}
            participantCount={participantCount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetail;
