import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Paperclip, X, FileText } from "lucide-react";
import { CampaignMessageCard } from "./campaign-message-card";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    followUpSuggestion?: string;
    promptKey?: string;
  };
  context?: {
    objective?: string;
    segmentId?: number;
    segmentName?: string;
    groundingGuideIds?: number[];
    storySummaryIds?: number[];
    hasReferenceMaterials?: boolean;
  };
}

interface ChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, files?: string[]) => void;
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
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const { toast } = useToast();
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
    onSendMessage(input, attachedFiles.length > 0 ? attachedFiles : undefined);
    setInput("");
    setAttachedFiles([]);
  };

  const handleFileUpload = (filename: string, uploadURL: string) => {
    const fileRef = JSON.stringify({ filename, url: uploadURL });
    setAttachedFiles(prev => [...prev, fileRef]);
    toast({
      title: "File attached",
      description: `${filename} will be included in your message`
    });
  };

  const handleFileRemove = (index: number) => {
    try {
      const fileData = JSON.parse(attachedFiles[index]);
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "File removed",
        description: `${fileData.filename} removed`
      });
    } catch {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }
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
                        className={`rounded-lg p-3 overflow-hidden ${
                          message.role === "assistant"
                            ? "bg-slate-100 text-slate-900"
                            : "bg-primary text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    )}
                    {message.campaign && message.role === "assistant" && (
                      <CampaignMessageCard
                        campaign={message.campaign}
                        context={message.context}
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
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-2 space-y-1">
              {attachedFiles.map((fileRef, index) => {
                try {
                  const fileData = JSON.parse(fileRef);
                  return (
                    <div key={index} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1">
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 mr-1 text-slate-400" />
                        <span className="truncate max-w-md">{fileData.filename}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 hover:bg-slate-200"
                        onClick={() => handleFileRemove(index)}
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          )}
          
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
            <div className="flex flex-col gap-2">
              <ObjectUploader
                maxNumberOfFiles={3}
                maxFileSize={10485760}
                onGetUploadParameters={async () => {
                  const response = await apiRequest("POST", "/api/objects/upload");
                  const data = await response.json();
                  return {
                    method: "PUT" as const,
                    url: data.uploadURL
                  };
                }}
                onComplete={async (result) => {
                  if (result.successful && result.successful.length > 0) {
                    const uploadedFile = result.successful[0];
                    if (uploadedFile.name && uploadedFile.uploadURL) {
                      handleFileUpload(uploadedFile.name, uploadedFile.uploadURL);
                    }
                  }
                }}
                buttonClassName="h-[28px] w-[60px] flex-shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </ObjectUploader>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[28px] w-[60px] flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
