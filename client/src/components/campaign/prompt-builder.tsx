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
import { FileText, Send, Plus, Loader2, Newspaper } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

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
  recentCampaigns: any[];
  selectedCampaigns: number[];
  onCampaignSelect: (campaignIds: number[]) => void;
  storySummaries?: any[];
  selectedSummaries?: number[];
  onSummarySelect?: (summaryIds: number[]) => void;
  onSummarize?: (data: { text?: string; url?: string }) => Promise<void>;
  onSendToChat?: (message: string) => void;
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
  recentCampaigns,
  selectedCampaigns,
  onCampaignSelect,
  storySummaries = [],
  selectedSummaries = [],
  onSummarySelect,
  onSummarize,
  onSendToChat,
}: PromptBuilderProps) {
  const [, setLocation] = useLocation();
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

  const handleSendToChat = () => {
    if (!onSendToChat) return;

    let message = "I'd like to create a campaign with the following context:\n\n";
    
    // Add objective
    const objectiveLabel = OBJECTIVE_OPTIONS.find(opt => opt.value === objective)?.label || objective;
    message += `🎯 Campaign Objective: ${objectiveLabel}\n`;
    
    // Add grounding library
    const selectedGuide = groundingGuides.find(g => g.id === selectedGuideId);
    if (selectedGuide) {
      message += `📋 Grounding Library: ${selectedGuide.name}\n`;
    }
    
    // Add segments
    if (segments.length > 0) {
      const segmentLabels = segments.map(s => 
        SEGMENT_OPTIONS.find(opt => opt.id === s)?.label || s
      );
      message += `👥 Target Segments: ${segmentLabels.join(', ')}\n`;
    }
    
    // Add notes
    if (notes.trim()) {
      message += `📝 Notes: ${notes}\n`;
    }
    
    // Add reference campaigns
    if (selectedCampaigns.length > 0) {
      const refCampaigns = recentCampaigns
        .filter(c => selectedCampaigns.includes(c.id))
        .map(c => c.title);
      message += `🔗 Reference Campaigns: ${refCampaigns.join(', ')}\n`;
    }
    
    // Add story summaries
    if (selectedSummaries.length > 0) {
      const selectedStories = storySummaries
        .filter(s => selectedSummaries.includes(s.id))
        .map(s => s.title);
      message += `📰 Story References: ${selectedStories.join(', ')}\n`;
    }

    onSendToChat(message);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Prompt Builder</CardTitle>
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

        {/* Send to Chat Button */}
        <Button 
          onClick={handleSendToChat} 
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Context to Chat
        </Button>
      </CardContent>
    </Card>
  );
}
