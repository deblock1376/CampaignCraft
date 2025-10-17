import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Loader2, Newspaper, Send, Upload, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PromptBuilderProps {
  groundingGuides: any[];
  selectedGuideId?: number;
  onGuideChange: (guideId: number) => void;
  objective: string;
  onObjectiveChange: (objective: string) => void;
  segments: string[];
  onSegmentChange: (segments: string[]) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  noteFiles?: string[];
  onNoteFilesChange?: (files: string[]) => void;
  recentCampaigns: any[];
  selectedCampaigns: number[];
  onCampaignSelect: (campaignIds: number[]) => void;
  storySummaries?: any[];
  selectedSummaries?: number[];
  onSummarySelect?: (summaryIds: number[]) => void;
  onSummarize?: (data: { text?: string; url?: string }) => Promise<void>;
  onSendToChat?: () => void;
  aiModel?: string;
  onModelChange?: (model: string) => void;
}

const SEGMENT_OPTIONS = [
  { id: "donors", label: "Donors" },
  { id: "non-donors", label: "Non-Donors" },
  { id: "highly-engaged", label: "Highly Engaged Users" },
  { id: "disengaged", label: "Disengaged Users" },
];

const OBJECTIVE_OPTIONS = [
  { value: "donation", label: "Donation" },
  { value: "membership", label: "Membership" },
  { value: "engagement", label: "Engagement" },
];

const AI_MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

export function PromptBuilder({
  groundingGuides,
  selectedGuideId,
  onGuideChange,
  objective,
  onObjectiveChange,
  segments,
  onSegmentChange,
  notes,
  onNotesChange,
  noteFiles = [],
  onNoteFilesChange,
  recentCampaigns,
  selectedCampaigns,
  onCampaignSelect,
  storySummaries = [],
  selectedSummaries = [],
  onSummarySelect,
  onSummarize,
  onSendToChat,
  aiModel = "gpt-4o",
  onModelChange,
}: PromptBuilderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [storyInputType, setStoryInputType] = useState<"text" | "url">("text");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyText, setStoryText] = useState("");
  const [storyUrl, setStoryUrl] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSegmentToggle = (segmentId: string) => {
    const newSegments = segments.includes(segmentId)
      ? segments.filter(s => s !== segmentId)
      : [...segments, segmentId];
    onSegmentChange(newSegments);
  };

  const handleCampaignToggle = (campaignId: number) => {
    const newSelection = selectedCampaigns.includes(campaignId)
      ? selectedCampaigns.filter(id => id !== campaignId)
      : [...selectedCampaigns, campaignId];
    onCampaignSelect(newSelection);
  };

  const handleSummaryToggle = (summaryId: number) => {
    if (!onSummarySelect) return;
    const newSelection = selectedSummaries.includes(summaryId)
      ? selectedSummaries.filter(id => id !== summaryId)
      : [...selectedSummaries, summaryId];
    onSummarySelect(newSelection);
  };

  const handleSummarizeStory = async () => {
    if (!onSummarize) return;
    
    setIsSummarizing(true);
    try {
      await onSummarize({
        text: storyInputType === "text" ? storyText : undefined,
        url: storyInputType === "url" ? storyUrl : undefined,
      });
      // Clear form after successful summarization
      setStoryText("");
      setStoryUrl("");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileUpload = async (filename: string, uploadURL: string) => {
    if (!onNoteFilesChange) return;
    const fileRef = JSON.stringify({ filename, url: uploadURL });
    const newFiles = [...noteFiles, fileRef];
    onNoteFilesChange(newFiles);
    toast({
      title: "File uploaded",
      description: `${filename} added to campaign notes`
    });
  };

  const handleFileRemove = (fileIndex: number) => {
    if (!onNoteFilesChange) return;
    const newFiles = noteFiles.filter((_, index) => index !== fileIndex);
    onNoteFilesChange(newFiles);
    try {
      const fileData = JSON.parse(noteFiles[fileIndex]);
      toast({
        title: "File removed",
        description: `${fileData.filename} removed from campaign notes`
      });
    } catch {
      toast({
        title: "File removed",
        description: "File removed from campaign notes"
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Campaign Builder</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Set your goals and audience</p>
          </div>
          {onSendToChat && (
            <Button onClick={onSendToChat} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send to Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-6 space-y-6">
        {/* Campaign Objective */}
        <div className="space-y-2">
          <Label>Campaign Objective</Label>
          <Select 
            value={objective} 
            onValueChange={onObjectiveChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign objective" />
            </SelectTrigger>
            <SelectContent>
              {OBJECTIVE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Model Selector */}
        {onModelChange && (
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select 
              value={aiModel} 
              onValueChange={onModelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Grounding Library Selector */}
        <div className="space-y-2">
          <Label>Grounding Library</Label>
          <Select 
            value={selectedGuideId?.toString()} 
            onValueChange={(value) => {
              if (value === "__create_new__") {
                setLocation('/assistant');
              } else {
                onGuideChange(Number(value));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a grounding library" />
            </SelectTrigger>
            <SelectContent>
              {groundingGuides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id.toString()}>
                  {guide.name}
                </SelectItem>
              ))}
              <Separator className="my-2" />
              <SelectItem 
                value="__create_new__" 
                className="text-primary font-medium"
              >
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create a new grounding library
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Segment Selection */}
        <div className="space-y-3">
          <Label>Target Segments</Label>
          <div className="space-y-2">
            {SEGMENT_OPTIONS.map((segment) => (
              <div key={segment.id} className="flex items-center space-x-2">
                <Checkbox
                  id={segment.id}
                  checked={segments.includes(segment.id)}
                  onCheckedChange={() => handleSegmentToggle(segment.id)}
                />
                <label
                  htmlFor={segment.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {segment.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Campaign Notes</Label>
          <Textarea
            placeholder="Add any additional context or requirements for the campaign..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          
          {/* File Upload for Notes */}
          {onNoteFilesChange && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Reference Files</Label>
                <ObjectUploader
                  maxNumberOfFiles={5}
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
                  buttonClassName="h-7 px-3 text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Add File
                </ObjectUploader>
              </div>
              
              {noteFiles.length > 0 && (
                <div className="space-y-1">
                  {noteFiles.map((fileRef, index) => {
                    try {
                      const fileData = JSON.parse(fileRef);
                      return (
                        <div key={index} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1">
                          <div className="flex items-center">
                            <FileText className="w-3 h-3 mr-1 text-slate-400" />
                            <span className="truncate max-w-48">{fileData.filename}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 hover:bg-slate-200"
                            onClick={() => handleFileRemove(index)}
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
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="space-y-2">
          <Label>Reference Recent Campaigns</Label>
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No recent campaigns</p>
            ) : (
              <div className="space-y-2">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`campaign-${campaign.id}`}
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={() => handleCampaignToggle(campaign.id)}
                    />
                    <label
                      htmlFor={`campaign-${campaign.id}`}
                      className="text-sm leading-tight cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="font-medium">{campaign.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {campaign.objective} • {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Story Summary */}
        <div className="space-y-3">
          <Label>Summarize a News Story</Label>
          <p className="text-xs text-muted-foreground">Add story context to inform campaign creation</p>
          
          <Tabs value={storyInputType} onValueChange={(v) => setStoryInputType(v as "text" | "url")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Paste Text</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="mt-3">
              <Textarea
                placeholder="Paste full story text here..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </TabsContent>
            
            <TabsContent value="url" className="mt-3">
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={storyUrl}
                onChange={(e) => setStoryUrl(e.target.value)}
              />
            </TabsContent>
          </Tabs>
          
          <Button
            onClick={handleSummarizeStory}
            disabled={(!storyText.trim() && !storyUrl.trim()) || isSummarizing}
            className="w-full"
            variant="outline"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Newspaper className="h-4 w-4 mr-2" />
                Summarize & Save
              </>
            )}
          </Button>

          {storySummaries.length > 0 && (
            <ScrollArea className="h-[150px] border rounded-md p-2 mt-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Saved Summaries</Label>
              <div className="space-y-2">
                {storySummaries.map((summary) => (
                  <div key={summary.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`summary-${summary.id}`}
                      checked={selectedSummaries.includes(summary.id)}
                      onCheckedChange={() => handleSummaryToggle(summary.id)}
                    />
                    <label
                      htmlFor={`summary-${summary.id}`}
                      className="text-sm leading-tight cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-1">
                        <Newspaper className="h-3 w-3" />
                        <span className="font-medium">{summary.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {summary.summary}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
