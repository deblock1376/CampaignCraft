import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Plus, Trash2, Wand2 } from "lucide-react";

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: string;
  title: string;
  description: string;
  icon: string;
}

export default function QuickStartModal({ isOpen, onClose, tool, title, description, icon }: QuickStartModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Common state
  const [context, setContext] = useState("");
  const [campaignType, setCampaignType] = useState("email");
  const [objective, setObjective] = useState("engagement");
  const [newsroomId] = useState(1); // For now, using newsroom ID 1
  
  // Rapid Response specific
  const [headline, setHeadline] = useState("");
  const [urgency, setUrgency] = useState("high");
  const [brandStylesheetId, setBrandStylesheetId] = useState("");
  
  // Segment specific
  const [campaignId, setCampaignId] = useState("");
  const [segments, setSegments] = useState([{ name: "", description: "" }]);
  
  // Grounding Library specific
  const [newsroomInfo, setNewsroomInfo] = useState("");
  const [existingContent, setExistingContent] = useState("");
  
  // Results state
  const [results, setResults] = useState<any>(null);

  const { data: brandStylesheets } = useQuery({
    queryKey: ["/api/brand-stylesheets", newsroomId],
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/campaigns", newsroomId],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoints = {
        'rapid-response': '/api/quickstart/rapid-response',
        'rewrite-segments': '/api/quickstart/rewrite-segments',
        'subject-lines': '/api/quickstart/subject-lines',
        'cta-buttons': '/api/quickstart/cta-buttons',
        'grounding-library': '/api/quickstart/grounding-library',
      };
      
      return apiRequest(endpoints[tool as keyof typeof endpoints], 'POST', data);
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Success!",
        description: `${title} generated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brand-stylesheets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    let data: any = { newsroomId };

    switch (tool) {
      case 'rapid-response':
        data = { ...data, headline, urgency, brandStylesheetId: brandStylesheetId || undefined };
        break;
      case 'rewrite-segments':
        data = { ...data, campaignId, segments: segments.filter(s => s.name && s.description) };
        break;
      case 'subject-lines':
        data = { ...data, context, campaignType, objective, count: 5 };
        break;
      case 'cta-buttons':
        data = { ...data, context, campaignType, objective, count: 5 };
        break;
      case 'grounding-library':
        data = { ...data, newsroomInfo, existingContent };
        break;
    }

    mutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const addSegment = () => {
    setSegments([...segments, { name: "", description: "" }]);
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...segments];
    updated[index][field] = value;
    setSegments(updated);
  };

  const reset = () => {
    setContext("");
    setHeadline("");
    setUrgency("high");
    setBrandStylesheetId("");
    setCampaignId("");
    setSegments([{ name: "", description: "" }]);
    setNewsroomInfo("");
    setExistingContent("");
    setResults(null);
  };

  const renderForm = () => {
    switch (tool) {
      case 'rapid-response':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="headline">Breaking News Headline *</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Local mayor announces major infrastructure project"
              />
            </div>
            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brandStylesheet">Brand Guidelines (Optional)</Label>
              <Select value={brandStylesheetId} onValueChange={setBrandStylesheetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose brand guidelines..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(brandStylesheets) ? brandStylesheets.map((sheet: any) => (
                    <SelectItem key={sheet.id} value={sheet.id.toString()}>
                      {sheet.name}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'rewrite-segments':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign">Source Campaign *</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose campaign to rewrite..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(campaigns) ? campaigns.map((campaign: any) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.title}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Audience Segments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSegment}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Segment
                </Button>
              </div>
              {segments.map((segment, index) => (
                <Card key={index} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Segment name (e.g., Young Professionals)"
                      value={segment.name}
                      onChange={(e) => updateSegment(index, 'name', e.target.value)}
                    />
                    {segments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSegment(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Describe this audience segment's characteristics..."
                    value={segment.description}
                    onChange={(e) => updateSegment(index, 'description', e.target.value)}
                  />
                </Card>
              ))}
            </div>
          </div>
        );

      case 'subject-lines':
      case 'cta-buttons':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="context">Campaign Context *</Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe what your campaign is about..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaignType">Campaign Type</Label>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="objective">Objective</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'grounding-library':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="newsroomInfo">About Your Newsroom</Label>
              <Textarea
                id="newsroomInfo"
                value={newsroomInfo}
                onChange={(e) => setNewsroomInfo(e.target.value)}
                placeholder="Tell us about your newsroom, mission, and audience..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="existingContent">Existing Content (Optional)</Label>
              <Textarea
                id="existingContent"
                value={existingContent}
                onChange={(e) => setExistingContent(e.target.value)}
                placeholder="Paste some existing content for AI to analyze your style..."
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return <div>Form not implemented for this tool.</div>;
    }
  };

  const renderResults = () => {
    if (!results) return null;

    switch (tool) {
      case 'rapid-response':
        return (
          <div className="space-y-4">
            <div className="text-sm text-green-600 font-medium">Campaign Created Successfully!</div>
            <div>
              <Label>Campaign Title</Label>
              <div className="p-2 bg-slate-50 rounded border">{results.title}</div>
            </div>
            <div>
              <Label>Subject Line</Label>
              <div className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                {results.content?.subject}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(results.content?.subject || '')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'rewrite-segments':
        return (
          <div className="space-y-4">
            <div className="text-sm text-green-600 font-medium">
              {results.length} Segment Variations Created
            </div>
            {results.map((campaign: any, index: number) => (
              <Card key={index} className="p-3">
                <div className="font-medium">{campaign.title}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {campaign.content?.subject}
                </div>
              </Card>
            ))}
          </div>
        );

      case 'subject-lines':
        return (
          <div className="space-y-4">
            <div className="text-sm text-green-600 font-medium">Subject Lines Generated</div>
            {results.subjectLines?.map((line: string, index: number) => (
              <div key={index} className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                {line}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(line)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        );

      case 'cta-buttons':
        return (
          <div className="space-y-4">
            <div className="text-sm text-green-600 font-medium">CTA Buttons Generated</div>
            {results.ctaButtons?.map((cta: string, index: number) => (
              <div key={index} className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                <Badge variant="outline">{cta}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(cta)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        );

      case 'grounding-library':
        return (
          <div className="space-y-4">
            <div className="text-sm text-green-600 font-medium">Grounding Guide Created!</div>
            <div>
              <Label>Brand Name</Label>
              <div className="p-2 bg-slate-50 rounded border">{results.name}</div>
            </div>
            <div>
              <Label>Tone</Label>
              <div className="p-2 bg-slate-50 rounded border">{results.tone}</div>
            </div>
            <div>
              <Label>Voice</Label>
              <div className="p-2 bg-slate-50 rounded border">{results.voice}</div>
            </div>
            <div>
              <Label>Key Messages</Label>
              <div className="space-y-1">
                {results.keyMessages?.map((message: string, index: number) => (
                  <div key={index} className="p-2 bg-slate-50 rounded border text-sm">
                    • {message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className={`${icon} text-blue-600`}></i>
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {results ? (
          <div className="space-y-4">
            {renderResults()}
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline">
                <Wand2 className="w-4 h-4 mr-2" />
                Create Another
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {renderForm()}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate {title}
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}