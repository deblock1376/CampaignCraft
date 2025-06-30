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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CampaignPreview from "./campaign-preview";

const formSchema = z.object({
  type: z.enum(['email', 'social', 'web']),
  objective: z.enum(['subscription', 'donation', 'membership', 'engagement']),
  context: z.string().min(10, "Please provide more context"),
  aiModel: z.string(),
  brandStylesheetId: z.string(),
});

export default function CampaignForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const { toast } = useToast();

  const { data: stylesheets } = useQuery({
    queryKey: ["/api/newsrooms/1/stylesheets"],
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/newsrooms/1/campaigns"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'email' as const,
      objective: 'subscription' as const,
      context: '',
      aiModel: 'gpt-4o',
      brandStylesheetId: '1',
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/campaigns/generate", {
        ...data,
        brandStylesheetId: parseInt(data.brandStylesheetId),
        newsroomId: 1,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCampaign(data);
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms/1/campaigns"] });
      toast({
        title: "Campaign Generated!",
        description: "Your AI-powered campaign has been created successfully.",
      });
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
    generateMutation.mutate(data);
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const recentCampaigns = campaigns?.slice(0, 2) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="aiModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gpt-4o">OpenAI GPT-4o (Creative)</SelectItem>
                          <SelectItem value="claude-sonnet-4-20250514">Anthropic Claude Sonnet 4 (Analytical)</SelectItem>
                          <SelectItem value="gemini-2.5-flash">Google Gemini 2.5 Flash (Fast & Balanced)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Type</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {(['email', 'social', 'web'] as const).map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={field.value === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange(type)}
                            className="flex flex-col h-auto py-3"
                          >
                            <i className={`fas fa-${type === 'email' ? 'envelope' : type === 'social' ? 'share-alt' : 'globe'} mb-1`}></i>
                            <span className="capitalize">{type}</span>
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandStylesheetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Stylesheet</FormLabel>
                      <div className="flex space-x-2">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select stylesheet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stylesheets?.map((stylesheet: any) => (
                              <SelectItem key={stylesheet.id} value={stylesheet.id.toString()}>
                                {stylesheet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm">
                          <i className="fas fa-cog"></i>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Objective</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="subscription">Drive Subscriptions</SelectItem>
                          <SelectItem value="donation">Increase Donations</SelectItem>
                          <SelectItem value="membership">Grow Membership</SelectItem>
                          <SelectItem value="engagement">Boost Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Context</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief context about the news story or campaign trigger..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate Campaign
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

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

      {/* Campaign Preview & Generation */}
      <div className="lg:col-span-2">
        <CampaignPreview 
          campaign={generatedCampaign} 
          isGenerating={generateMutation.isPending}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
