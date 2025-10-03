import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, CheckCircle, Clock } from "lucide-react";

interface Stats {
  totalEvents: number;
  totalParticipants: number;
  totalCertificates: number;
  pendingCertificates: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalParticipants: 0,
    totalCertificates: 0,
    pendingCertificates: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("organizer_id", userId);
      
      const { data: events } = await supabase
        .from("events")
        .select("id")
        .eq("organizer_id", userId);
      
      const eventIds = events?.map(e => e.id) || [];
      
      const { count: participantsCount } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .in("event_id", eventIds);
      
      const { count: certificatesCount } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .in("event_id", eventIds);
      
      const { count: pendingCount } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .in("event_id", eventIds)
        .eq("status", "generated");

      setStats({
        totalEvents: eventsCount || 0,
        totalParticipants: participantsCount || 0,
        totalCertificates: certificatesCount || 0,
        pendingCertificates: pendingCount || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Award,
      description: "Active and completed events",
    },
    {
      title: "Total Participants",
      value: stats.totalParticipants,
      icon: Users,
      description: "Across all events",
    },
    {
      title: "Certificates Issued",
      value: stats.totalCertificates,
      icon: CheckCircle,
      description: "Successfully generated",
    },
    {
      title: "Pending Delivery",
      value: stats.pendingCertificates,
      icon: Clock,
      description: "Awaiting distribution",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here's an overview of your certificate automation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with certificate automation</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <a
            href="/dashboard/events"
            className="p-6 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Award className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Create New Event</h3>
            <p className="text-sm text-muted-foreground">
              Set up a new event and start generating certificates
            </p>
          </a>
          <a
            href="/verify"
            className="p-6 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <CheckCircle className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Verify Certificate</h3>
            <p className="text-sm text-muted-foreground">
              Check the authenticity of any certificate
            </p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
