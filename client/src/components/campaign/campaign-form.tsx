import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CampaignPreview from "./campaign-preview";
import DraftCarousel from "./draft-carousel";

const formSchema = z.object({
  type: z.enum(['email', 'social']),
  objective: z.enum(['donation', 'membership', 'engagement']),
  context: z.string().min(10, "Please provide more context"),
  aiModel: z.string(),
  brandStylesheetId: z.string(),
});

export default function CampaignForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<any[]>([]);
  const [useMultiDraft, setUseMultiDraft] = useState(true);
  const [compareModels, setCompareModels] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;

  const { data: stylesheets } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "stylesheets"],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/stylesheets`);
      if (!response.ok) throw new Error('Failed to fetch stylesheets');
      return response.json();
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/campaigns`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'email' as const,
      objective: 'donation' as const,
      context: '',
      aiModel: 'gpt-4o',
      brandStylesheetId: '1',
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = useMultiDraft ? "/api/campaigns/generate-drafts" : "/api/campaigns/generate";
      const response = await apiRequest("POST", endpoint, {
        ...data,
        brandStylesheetId: parseInt(data.brandStylesheetId),
        newsroomId: newsroomId,
        draftCount: compareModels ? 3 : 5,
        compareModels: compareModels,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        setGeneratedDrafts(data);
        setGeneratedCampaign(null);
        toast({
          title: `${data.length} Draft Variations Generated!`,
          description: "Review and select your favorite campaign variations below.",
        });
      } else {
        setGeneratedCampaign(data);
        setGeneratedDrafts([]);
        toast({
          title: "Campaign Generated!",
          description: "Your AI-powered campaign has been created successfully.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "campaigns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setGeneratedDrafts([]);
    setGeneratedCampaign(null);
    generateMutation.mutate(data);
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleMergeComplete = (mergedCampaign: any) => {
    setGeneratedCampaign(mergedCampaign);
    setGeneratedDrafts([]);
  };

  const recentCampaigns = Array.isArray(campaigns) ? campaigns.slice(0, 2) : [];

  return (
    <div className="space-y-8">
      {/* Multi-Draft Options */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="multi-draft" className="text-base">
                Generate Multiple Variations
              </Label>
              <p className="text-sm text-slate-500">
                Create {compareModels ? '3 AI model' : '5 AI-powered'} draft variations to review and merge
              </p>
            </div>
            <Switch
              id="multi-draft"
              checked={useMultiDraft}
              onCheckedChange={(checked) => {
                setUseMultiDraft(checked);
                if (!checked) setCompareModels(false);
              }}
              data-testid="switch-multi-draft"
            />
          </div>
          
          {useMultiDraft && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-slate-200">
              <div className="space-y-0.5">
                <Label htmlFor="compare-models" className="text-sm">
                  Compare AI Models
                </Label>
                <p className="text-xs text-slate-500">
                  Generate one draft from each AI model (GPT-4o, Claude, Gemini)
                </p>
              </div>
              <Switch
                id="compare-models"
                checked={compareModels}
                onCheckedChange={setCompareModels}
                data-testid="switch-compare-models"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Preview & Generation */}
      <div>
        <CampaignPreview 
          campaign={generatedCampaign} 
          isGenerating={generateMutation.isPending}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          form={form}
          onSubmit={onSubmit}
          generateMutation={generateMutation}
          stylesheets={stylesheets}
          isConfigOpen={isConfigOpen}
          setIsConfigOpen={setIsConfigOpen}
        />
      </div>

      {/* Draft Carousel */}
      {generatedDrafts.length > 0 && (
        <DraftCarousel drafts={generatedDrafts} onMerge={handleMergeComplete} />
      )}

      {/* Recent Campaigns */}
      <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {recentCampaigns.map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{campaign.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(campaign.createdAt).toLocaleDateString()} • {campaign.type}
                      </p>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recent campaigns</p>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
