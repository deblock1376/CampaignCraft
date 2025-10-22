import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ChatAssistant, { ChatMessage } from "@/components/chat/chat-assistant";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PromptBuilder } from "@/components/campaign/prompt-builder";

export default function CampaignAssistantTest() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user?.newsroomId || 1; // Default to newsroom 1 for admin/testing
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversationLoaded, setConversationLoaded] = useState(false);
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
  const [noteFiles, setNoteFiles] = useState<string[]>([]);
  const [selectedRecentCampaigns, setSelectedRecentCampaigns] = useState<number[]>([]);
  const [selectedStorySummaries, setSelectedStorySummaries] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-5");
  const [selectedCampaignPlan, setSelectedCampaignPlan] = useState<number | undefined>();

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
          aiModel: "gpt-5",
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

  // Fetch campaign plans
  const { data: campaignPlans = [] } = useQuery({
    queryKey: [`/api/newsrooms/${newsroomId}/campaign-plans`],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/campaign-plans`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch campaign plans");
      }
      return response.json();
    },
    enabled: !!newsroomId,
  });

  // Check URL for planId parameter and autofill sidebar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get('planId');
    if (planId && campaignPlans.length > 0) {
      const plan = (campaignPlans as any[]).find((p: any) => p.id === parseInt(planId));
      if (plan && plan.inputs) {
        // Set campaign plan
        setSelectedCampaignPlan(parseInt(planId));
        
        // Autofill sidebar fields from plan inputs
        if (plan.inputs.groundingLibraryId) {
          setSelectedGuideId(plan.inputs.groundingLibraryId);
        }
        
        if (plan.inputs.campaignGoal) {
          // Map campaign goal to objective if possible
          const goal = plan.inputs.campaignGoal.toLowerCase();
          if (goal.includes('donation') || goal.includes('fundrais')) {
            setSelectedObjective('donation');
          } else if (goal.includes('member')) {
            setSelectedObjective('membership');
          } else if (goal.includes('engage') || goal.includes('event')) {
            setSelectedObjective('engagement');
          }
        }
        
        if (plan.inputs.campaignNotes) {
          setCampaignNotes(plan.inputs.campaignNotes);
        }
        
        if (plan.inputs.campaignNoteFiles && Array.isArray(plan.inputs.campaignNoteFiles)) {
          setNoteFiles(plan.inputs.campaignNoteFiles);
        }
        
        if (plan.aiModel) {
          setSelectedModel(plan.aiModel);
        }
        
        toast({
          title: "Campaign Plan Loaded",
          description: "Campaign settings have been auto-filled from your plan.",
        });
      }
    }
  }, [toast, campaignPlans]);

  // Load conversation from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conversationId');
    
    if (convId && !conversationLoaded) {
      const loadConversation = async () => {
        try {
          // Fetch conversation record (includes context)
          const conversationResponse = await fetch(`/api/conversations/${convId}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          if (!conversationResponse.ok) {
            toast({
              title: "Error",
              description: "Failed to load conversation. It may have been deleted.",
              variant: "destructive",
            });
            return;
          }
          
          const conversation = await conversationResponse.json();
          
          // Fetch conversation messages
          const messagesResponse = await fetch(`/api/conversations/${convId}/messages`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          if (!messagesResponse.ok) {
            toast({
              title: "Error",
              description: "Failed to load conversation messages.",
              variant: "destructive",
            });
            return;
          }
          
          const dbMessages = await messagesResponse.json();
          
          // Convert database messages to ChatMessage format
          const loadedMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            campaign: msg.metadata?.campaign,
          }));
          
          setMessages(loadedMessages);
          setConversationId(parseInt(convId));
          
          // Restore Campaign Builder context
          if (conversation.context) {
            if (conversation.context.objective) {
              setSelectedObjective(conversation.context.objective);
            }
            if (conversation.context.guideId) {
              setSelectedGuideId(conversation.context.guideId);
            }
            if (conversation.context.segments && Array.isArray(conversation.context.segments)) {
              setSelectedSegments(conversation.context.segments);
            }
          }
          
          // Restore campaign plan if linked
          if (conversation.campaignPlanId) {
            setSelectedCampaignPlan(conversation.campaignPlanId);
          }
          
          setConversationLoaded(true);
          
          toast({
            title: "Conversation Loaded",
            description: "Your previous conversation and settings have been restored.",
          });
        } catch (error) {
          console.error('Failed to load conversation:', error);
          toast({
            title: "Error",
            description: "An unexpected error occurred loading the conversation.",
            variant: "destructive",
          });
        }
      };
      
      loadConversation();
    }
  }, [conversationLoaded, toast]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ message, files }: { message: string; files?: string[] }) => {
      // Build enriched context from Campaign Builder
      const enrichedContext = {
        segments: selectedSegments.length > 0 ? selectedSegments : undefined,
        notes: campaignNotes.trim() || undefined,
        noteFiles: [...(noteFiles.length > 0 ? noteFiles : []), ...(files || [])],
        referenceCampaigns: selectedRecentCampaigns.length > 0 
          ? (recentCampaigns as any[])
              .filter((c: any) => selectedRecentCampaigns.includes(c.id))
              .map((c: any) => ({
                id: c.id,
                title: c.title,
                objective: c.objective,
              }))
          : undefined,
        campaignPlan: selectedCampaignPlan
          ? (() => {
              const plan = (campaignPlans as any[]).find((p: any) => p.id === selectedCampaignPlan);
              return plan ? {
                id: plan.id,
                plan: plan.generatedPlan,
                inputs: plan.inputs,
              } : undefined;
            })()
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
    onSuccess: async (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save messages to database if conversation exists
      if (conversationId) {
        try {
          // Save user message
          const userMsg = messages[messages.length - 1];
          if (userMsg && userMsg.role === 'user') {
            await fetch(`/api/conversations/${conversationId}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                role: 'user',
                content: userMsg.content,
              }),
            });
          }
          
          // Save assistant message
          await fetch(`/api/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              role: 'assistant',
              content: data.message,
              metadata: data.campaign ? { campaign: data.campaign } : undefined,
            }),
          });
        } catch (error) {
          console.error('Failed to save messages:', error);
        }
      }
      
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
      
      // Get campaign plan data if selected
      const campaignPlanData = selectedCampaignPlan 
        ? (() => {
            const plan = (campaignPlans as any[]).find((p: any) => p.id === selectedCampaignPlan);
            return plan ? {
              id: plan.id,
              plan: plan.generatedPlan,
              inputs: plan.inputs,
            } : undefined;
          })()
        : undefined;

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
          aiModel: selectedModel,
          noteFiles: noteFiles.length > 0 ? noteFiles : undefined,
          campaignPlan: campaignPlanData,
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
        context: {
          objective: selectedObjective,
          groundingGuideIds: selectedGuideId ? [selectedGuideId] : undefined,
          storySummaryIds: selectedStorySummaries.length > 0 ? selectedStorySummaries : undefined,
          hasReferenceMaterials: selectedRecentCampaigns.length > 0,
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
          aiModel: selectedModel,
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

  const OBJECTIVE_OPTIONS = [
    { value: "donation", label: "Donation" },
    { value: "membership", label: "Membership" },
    { value: "engagement", label: "Engagement" },
  ];

  const SEGMENT_OPTIONS = [
    { id: "donors", label: "Donors" },
    { id: "non-donors", label: "Non-Donors" },
    { id: "highly-engaged", label: "Highly Engaged Users" },
    { id: "disengaged", label: "Disengaged Users" },
  ];

  const handleSendContextToChat = () => {
    let message = "I'd like to create a campaign with the following context:\n\n";
    
    // Add objective
    const objectiveLabel = OBJECTIVE_OPTIONS.find(opt => opt.value === selectedObjective)?.label || selectedObjective;
    message += `🎯 Campaign Objective: ${objectiveLabel}\n`;
    
    // Add grounding library
    const selectedGuide = groundingGuides.find((g: any) => g.id === selectedGuideId);
    if (selectedGuide) {
      message += `📋 Grounding Library: ${selectedGuide.name}\n`;
    }
    
    // Add campaign plan
    if (selectedCampaignPlan) {
      const plan = campaignPlans.find((p: any) => p.id === selectedCampaignPlan);
      if (plan) {
        message += `📅 Campaign Plan: ${plan.title}\n`;
      }
    }
    
    // Add segments
    if (selectedSegments.length > 0) {
      const segmentLabels = selectedSegments.map(s => 
        SEGMENT_OPTIONS.find(opt => opt.id === s)?.label || s
      );
      message += `👥 Target Segments: ${segmentLabels.join(', ')}\n`;
    }
    
    // Add notes
    if (campaignNotes.trim()) {
      message += `📝 Notes: ${campaignNotes}\n`;
    }
    
    // Add reference campaigns
    if (selectedRecentCampaigns.length > 0) {
      const refCampaigns = recentCampaigns
        .filter((c: any) => selectedRecentCampaigns.includes(c.id))
        .map((c: any) => c.title);
      message += `🔗 Reference Campaigns: ${refCampaigns.join(', ')}\n`;
    }
    
    // Add story summaries
    if (selectedStorySummaries.length > 0) {
      const selectedStories = storySummaries
        .filter((s: any) => selectedStorySummaries.includes(s.id))
        .map((s: any) => s.title);
      message += `📰 Story References: ${selectedStories.join(', ')}\n`;
    }

    handleSendMessage(message);
  };

  const handleSendMessage = async (message: string, files?: string[]) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Create conversation if it doesn't exist
    if (!conversationId) {
      try {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            newsroomId,
            userId: user.id,
            campaignPlanId: selectedCampaignPlan,
            title: message.substring(0, 100), // Use first 100 chars as title
            context: {
              objective: selectedObjective,
              guideId: selectedGuideId,
              segments: selectedSegments,
            },
          }),
        });
        
        if (response.ok) {
          const conversation = await response.json();
          setConversationId(conversation.id);
          
          // Update URL with conversationId
          const url = new URL(window.location.href);
          url.searchParams.set('conversationId', conversation.id.toString());
          window.history.pushState({}, '', url.toString());
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }
    
    chatMutation.mutate({ message, files });
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

  // Get selected campaign plan details for title
  const selectedPlanDetails = selectedCampaignPlan 
    ? (campaignPlans as any[]).find((p: any) => p.id === selectedCampaignPlan)
    : null;

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={selectedPlanDetails?.title || "Campaign Assistant"} 
          subtitle="Chat with AI to create your campaign"
        />
        
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
              noteFiles={noteFiles}
              onNoteFilesChange={setNoteFiles}
              recentCampaigns={recentCampaigns as any[]}
              selectedCampaigns={selectedRecentCampaigns}
              onCampaignSelect={setSelectedRecentCampaigns}
              selectedCampaignPlan={selectedCampaignPlan}
              onCampaignPlanSelect={setSelectedCampaignPlan}
              storySummaries={storySummaries as any[]}
              selectedSummaries={selectedStorySummaries}
              onSummarySelect={setSelectedStorySummaries}
              onSummarize={summarizeMutation.mutateAsync}
              onSendToChat={handleSendContextToChat}
              aiModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
