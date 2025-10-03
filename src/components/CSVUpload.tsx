import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, FileText } from "lucide-react";

interface CSVUploadProps {
  eventId: string;
  onUploadComplete: () => void;
}

const CSVUpload = ({ eventId, onUploadComplete }: CSVUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): { name: string; email: string }[] => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    
    const nameIndex = headers.findIndex(h => h.includes("name"));
    const emailIndex = headers.findIndex(h => h.includes("email"));
    
    if (nameIndex === -1 || emailIndex === -1) {
      throw new Error("CSV must contain 'name' and 'email' columns");
    }

    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      return {
        name: values[nameIndex],
        email: values[emailIndex],
      };
    }).filter(p => p.name && p.email);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const participants = parseCSV(text);

      if (participants.length === 0) {
        throw new Error("No valid participants found in CSV");
      }

      const { error } = await supabase.from("participants").insert(
        participants.map(p => ({
          event_id: eventId,
          name: p.name,
          email: p.email,
        }))
      );

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${participants.length} participants uploaded successfully`,
      });

      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Participants</CardTitle>
        <CardDescription>
          Upload a CSV file with participant names and emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            CSV should have columns: name, email
          </p>
        </div>

        {file && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Participants
            </>
          )}
        </Button>

        <div className="mt-6 p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-2">CSV Format Example:</h4>
          <pre className="text-sm bg-background p-3 rounded">
            {`name,email
John Doe,john@example.com
Jane Smith,jane@example.com`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;
