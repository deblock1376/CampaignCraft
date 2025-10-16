import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, ExternalLink, Trash2, Calendar, Sparkles, FileText, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function StorySummaries() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user?.newsroomId || 1;
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  const { data: summaries = [], refetch } = useQuery({
    queryKey: [`/api/newsrooms/${newsroomId}/story-summaries`],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/story-summaries`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch story summaries");
      }
      return response.json();
    },
    enabled: !!newsroomId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/story-summaries/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete story summary");
      }
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Story summary deleted successfully",
      });
      refetch();
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete story summary",
        variant: "destructive",
      });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async (data: { text?: string; url?: string }) => {
      const response = await fetch("/api/story-summaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newsroomId,
          text: data.text,
          url: data.url,
          aiModel: "gpt-4o",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to summarize story");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Story summarized successfully",
      });
      refetch();
      setInputText("");
      setInputUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to summarize story",
        variant: "destructive",
      });
    },
  });

  const handleSummarize = () => {
    if (activeTab === "text" && inputText.trim()) {
      summarizeMutation.mutate({ text: inputText });
    } else if (activeTab === "url" && inputUrl.trim()) {
      summarizeMutation.mutate({ url: inputUrl });
    } else {
      toast({
        title: "Input Required",
        description: `Please enter ${activeTab === "text" ? "text" : "a URL"} to summarize`,
        variant: "destructive",
      });
    }
  };

  if (!user?.id) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Header 
            title="Story Summaries" 
            subtitle="View and manage your saved story summaries"
          />
          <div className="container mx-auto py-8">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Please sign in to view story summaries.</p>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Story Summaries" 
          subtitle="View and manage your saved story summaries"
        />
        <div className="container mx-auto py-8 space-y-6">

          {/* Summarize Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Summarize Story
              </CardTitle>
              <CardDescription>
                Create an AI-powered summary from article text or URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">
                    <FileText className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-4 space-y-4">
                  <Textarea
                    placeholder="Paste your article text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <Button 
                    onClick={handleSummarize} 
                    disabled={summarizeMutation.isPending || !inputText.trim()}
                    className="w-full"
                  >
                    {summarizeMutation.isPending ? (
                      <>
                        <span className="mr-2">Summarizing...</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="url" className="mt-4 space-y-4">
                  <Input
                    type="url"
                    placeholder="https://example.com/article"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the URL of an article to fetch and summarize automatically
                  </p>
                  <Button 
                    onClick={handleSummarize} 
                    disabled={summarizeMutation.isPending || !inputUrl.trim()}
                    className="w-full"
                  >
                    {summarizeMutation.isPending ? (
                      <>
                        <span className="mr-2">Summarizing...</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Summaries List */}
          {summaries.length === 0 ? (
            <Card className="p-12 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No story summaries yet</h3>
              <p className="text-muted-foreground">
                Use the form above to create your first summary
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {summaries.map((summary: any) => (
                <Card key={summary.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Newspaper className="h-5 w-5" />
                          {summary.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(summary.createdAt).toLocaleDateString()}
                          </div>
                          {summary.originalUrl && (
                            <a
                              href={summary.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Original
                            </a>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(summary.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {summary.summary}
                        </p>
                      </div>
                      {summary.originalText && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Original Text</h4>
                          <ScrollArea className="h-[150px] border rounded-md p-3">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {summary.originalText}
                            </p>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Story Summary?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this story summary.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </>
  );
}
