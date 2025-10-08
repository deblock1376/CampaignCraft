import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ChatAssistant, { ChatMessage } from "@/components/chat/chat-assistant";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
    objective: "engagement",
    context: "",
  });

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

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
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
      // Get the first available grounding guide if not specified
      const brandStylesheetId = params.brandStylesheetId || (groundingGuides as any[])[0]?.id;
      
      if (!brandStylesheetId) {
        throw new Error("No grounding guide available. Please create one first.");
      }
      
      const response = await fetch(`/api/campaigns/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type: "email",
          objective: params.objective,
          context: params.context,
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
      const campaignMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Here's your generated campaign:",
        timestamp: new Date(),
        campaign: typeof data.content === 'string' ? JSON.parse(data.content) : data.content,
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
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">Campaign Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Chat with AI to create your campaign
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto max-w-4xl h-full py-6">
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
    </div>
  );
}
