import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { CampaignMessageCard } from "./campaign-message-card";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  campaign?: {
    subjectLine: string;
    body: string;
    cta: {
      text: string;
      url?: string;
    };
  };
}

interface ChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onSaveCampaign?: (campaign: ChatMessage["campaign"]) => void;
  onExportCampaign?: (campaign: ChatMessage["campaign"]) => void;
  onRegenerateCampaign?: () => void;
}

export default function ChatAssistant({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  onSaveCampaign,
  onExportCampaign,
  onRegenerateCampaign 
}: ChatAssistantProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white shadow-lg">
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bot className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Campaign Assistant</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  I'll help you create an effective marketing campaign through conversation. Just tell me what you have in mind, and I'll guide you through the process.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "assistant" ? "" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "assistant"
                        ? "bg-primary text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {message.content && (
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "assistant"
                            ? "bg-slate-100 text-slate-900"
                            : "bg-primary text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}
                    {message.campaign && message.role === "assistant" && (
                      <CampaignMessageCard
                        campaign={message.campaign}
                        onSave={() => onSaveCampaign?.(message.campaign)}
                        onExport={() => onExportCampaign?.(message.campaign)}
                        onRegenerate={onRegenerateCampaign}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 rounded-lg p-3 bg-slate-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your campaign idea..."
              className="resize-none min-h-[60px] max-h-[120px]"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
