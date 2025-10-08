import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ChatAssistant, { ChatMessage } from "@/components/chat/chat-assistant";
import CampaignForm from "@/components/campaign/campaign-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CampaignAssistantTest() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch grounding guides for the chat context
  const { data: groundingGuides = [] } = useQuery({
    queryKey: [`/api/newsrooms/${user?.newsroomId}/brand-stylesheets`],
    enabled: !!user?.newsroomId,
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
          newsroomId: user?.newsroomId,
          groundingGuides: groundingGuides.map((g: any) => ({
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get response from assistant",
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

  if (!user?.newsroomId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to use the campaign assistant.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Campaign Assistant (Test)</h1>
          <p className="text-sm text-muted-foreground">
            Conversational campaign creation with AI guidance
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full py-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Chat Assistant - Left Side */}
            <div className="h-full">
              <ChatAssistant
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={chatMutation.isPending}
              />
            </div>

            {/* Campaign Workspace - Right Side */}
            <div className="h-full overflow-auto">
              <CampaignForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
