import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import ChatAssistant, { ChatMessage } from "@/components/chat/chat-assistant";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PromptBuilder } from "@/components/campaign/prompt-builder";
import { ArrowLeft } from "lucide-react";

export default function CampaignAssistantTest() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user?.newsroomId || 1; // Default to newsroom 1 for admin/testing
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [campaignParams, setCampaignParams] = useState<{
    objective: string;
    context: string;
    brandStylesheetId?: number;
  }>({
    objective: "donation",
    context: "",
  });

  // Campaign Builder state
  const [selectedObjective, setSelectedObjective] = useState("donation");
  const [selectedGuideId, setSelectedGuideId] = useState<number | undefined>();
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [campaignNotes, setCampaignNotes] = useState("");
  const [selectedRecentCampaigns, setSelectedRecentCampaigns] = useState<number[]>([]);
  const [selectedStorySummaries, setSelectedStorySummaries] = useState<number[]>([]);

  // Fetch grounding guides for the chat context
  const { data: groundingGuides = [] } = useQuery({
    queryKey: [`/api/newsrooms/${newsroomId}/stylesheets`],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/stylesheets`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch grounding guides");
      }
      return response.json();
    },
    enabled: !!newsroomId,
  });

  // Fetch recent campaigns for reference
  const { data: recentCampaigns = [] } = useQuery({
    queryKey: [`/api/newsrooms/${newsroomId}/campaigns`, "recent"],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/campaigns?limit=10`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recent campaigns");
      }
      return response.json();
    },
    enabled: !!newsroomId,
  });

  // Fetch story summaries
  const { data: storySummaries = [], refetch: refetchStorySummaries } = useQuery({
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

  // Story summary creation mutation
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
        description: "Story summarized and saved successfully",
      });
      refetchStorySummaries();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to summarize story",
        variant: "destructive",
      });
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // Build enriched context from Campaign Builder
      const enrichedContext = {
        segments: selectedSegments.length > 0 ? selectedSegments : undefined,
        notes: campaignNotes.trim() || undefined,
        referenceCampaigns: selectedRecentCampaigns.length > 0 
          ? (recentCampaigns as any[])
              .filter((c: any) => selectedRecentCampaigns.includes(c.id))
              .map((c: any) => ({
                id: c.id,
                title: c.title,
                objective: c.objective,
              }))
          : undefined,
        storySummaries: selectedStorySummaries.length > 0
          ? (storySummaries as any[])
              .filter((s: any) => selectedStorySummaries.includes(s.id))
              .map((s: any) => ({
                id: s.id,
                title: s.title,
                summary: s.summary,
              }))
          : undefined,
      };

      const response = await fetch("/api/campaigns/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages,
          newsroomId: newsroomId,
          groundingGuides: (groundingGuides as any[]).map((g: any) => ({
            id: g.id,
            name: g.name,
          })),
          selectedGuideId: selectedGuideId,
          promptContext: enrichedContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // If AI wants to generate campaign, trigger generation
      if (data.shouldGenerate && data.campaignParams) {
        console.log('Triggering campaign generation with params:', data.campaignParams);
        console.log('Available grounding guides:', groundingGuides);
        setCampaignParams(data.campaignParams);
        setTimeout(() => {
          generateCampaignMutation.mutate(data.campaignParams);
        }, 500);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get response from assistant",
        variant: "destructive",
      });
    },
  });

  // Campaign generation mutation
  const generateCampaignMutation = useMutation({
    mutationFn: async (params: { objective: string; context: string; brandStylesheetId?: number }) => {
      // Use selected guide from Prompt Builder, fallback to first available
      const brandStylesheetId = selectedGuideId || params.brandStylesheetId || (groundingGuides as any[])[0]?.id;
      
      if (!brandStylesheetId) {
        throw new Error("No grounding guide available. Please select one in the Prompt Builder.");
      }

      // Build enriched context for generation
      let enrichedContext = params.context;
      
      if (campaignNotes.trim()) {
        enrichedContext += `\n\nAdditional Notes: ${campaignNotes}`;
      }
      
      if (selectedSegments.length > 0) {
        enrichedContext += `\n\nTarget Segments: ${selectedSegments.join(', ')}`;
      }
      
      if (selectedRecentCampaigns.length > 0) {
        const refCampaigns = (recentCampaigns as any[])
          .filter((c: any) => selectedRecentCampaigns.includes(c.id))
          .map((c: any) => c.title)
          .join(', ');
        enrichedContext += `\n\nReference similar campaigns: ${refCampaigns}`;
      }
      
      const response = await fetch(`/api/campaigns/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type: "email",
          objective: selectedObjective || params.objective,
          context: enrichedContext,
          brandStylesheetId: brandStylesheetId,
          newsroomId: newsroomId,
          aiModel: "gpt-4o",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate campaign");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Add campaign to messages
      // The API returns a campaign object with content field containing the generated campaign
      const generatedCampaign = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      
      // Transform to match CampaignMessageCard expected format
      const campaignMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Here's your generated campaign:",
        timestamp: new Date(),
        campaign: {
          subjectLine: generatedCampaign.subject || "Campaign Subject",
          body: generatedCampaign.content || "",
          cta: {
            text: generatedCampaign.cta || "Learn More",
          },
          followUpSuggestion: generatedCampaign.followUpSuggestion,
          promptKey: generatedCampaign.promptKey,
        },
      };
      setMessages(prev => [...prev, campaignMessage]);
    },
    onError: (error) => {
      console.error('Campaign generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate campaign",
        variant: "destructive",
      });
    },
  });

  // Save campaign mutation
  const saveCampaignMutation = useMutation({
    mutationFn: async (campaign: any) => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: campaign.subjectLine.substring(0, 100),
          type: "email",
          objective: campaignParams.objective || "engagement",
          context: campaignParams.context || "",
          aiModel: "gpt-4o",
          content: JSON.stringify(campaign),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
  };

  const handleSaveCampaign = (campaign: any) => {
    if (campaign) {
      saveCampaignMutation.mutate(campaign);
    }
  };

  const handleExportCampaign = (campaign: any) => {
    if (campaign) {
      // Create a text export of the campaign
      const exportText = `Subject: ${campaign.subjectLine}\n\n${campaign.body}\n\nCTA: ${campaign.cta.text}${campaign.cta.url ? ` (${campaign.cta.url})` : ''}`;
      
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exported",
        description: "Campaign downloaded as text file",
      });
    }
  };

  const handleRegenerateCampaign = () => {
    if (campaignParams.context && campaignParams.objective) {
      generateCampaignMutation.mutate(campaignParams);
    }
  };

  if (!user?.id) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to use the campaign assistant.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="border-b bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Campaign Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Chat with AI to create your campaign
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex">
        {/* Chat Column - Left (60%) */}
        <div className="w-3/5 border-r overflow-auto">
          <div className="h-full py-6 px-4">
            <ChatAssistant
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={chatMutation.isPending || generateCampaignMutation.isPending}
              onSaveCampaign={handleSaveCampaign}
              onExportCampaign={handleExportCampaign}
              onRegenerateCampaign={handleRegenerateCampaign}
            />
          </div>
        </div>

        {/* Prompt Builder Column - Right (40%) */}
        <div className="w-2/5 overflow-auto bg-white">
          <div className="h-full p-4">
            <PromptBuilder
              groundingGuides={groundingGuides as any[]}
              selectedGuideId={selectedGuideId}
              onGuideChange={setSelectedGuideId}
              objective={selectedObjective}
              onObjectiveChange={setSelectedObjective}
              segments={selectedSegments}
              onSegmentChange={setSelectedSegments}
              notes={campaignNotes}
              onNotesChange={setCampaignNotes}
              recentCampaigns={recentCampaigns as any[]}
              selectedCampaigns={selectedRecentCampaigns}
              onCampaignSelect={setSelectedRecentCampaigns}
              storySummaries={storySummaries as any[]}
              selectedSummaries={selectedStorySummaries}
              onSummarySelect={setSelectedStorySummaries}
              onSummarize={summarizeMutation.mutateAsync}
              onSendToChat={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
