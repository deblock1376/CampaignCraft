import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, Target, MousePointer, Copy, RefreshCw, Zap } from "lucide-react";

const optimizationSchema = z.object({
  contentType: z.enum(["subject_line", "preheader", "button_text"]),
  campaignContext: z.string().min(10, "Please provide more context about your campaign"),
  targetAudience: z.string().min(5, "Please describe your target audience"),
  mainGoal: z.string().min(5, "Please describe the main goal"),
  existingText: z.string().optional(),
});

type OptimizationForm = z.infer<typeof optimizationSchema>;

interface GeneratedOption {
  text: string;
  reasoning: string;
  score: number;
  category: string;
}

export default function EmailOptimizer() {
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const form = useForm<OptimizationForm>({
    resolver: zodResolver(optimizationSchema),
    defaultValues: {
      contentType: "subject_line",
      campaignContext: "",
      targetAudience: "",
      mainGoal: "",
      existingText: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: OptimizationForm) => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/email-optimizer/generate", data);
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedOptions(result.options || []);
      toast({
        title: "Content generated!",
        description: `Generated ${result.options?.length || 0} optimized options`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: "Failed to generate optimized content",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const onSubmit = (data: OptimizationForm) => {
    generateMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case "subject_line": return "Subject Lines";
      case "preheader": return "Preheader Text";
      case "button_text": return "Button Text";
      default: return type;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-slate-500";
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen ml-64">
        <Header title="Email Content Optimizer" subtitle="Generate high-performing email content for nonprofit news" />
        
        <div className="flex-1 p-8 overflow-y-auto max-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Email Content Optimizer</h1>
              <p className="text-slate-600">Generate high-performing subject lines, preheader text, and button copy optimized for nonprofit local news</p>
            </div>

            <div className="space-y-8">
              {/* Generator Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Content Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="subject_line">Subject Lines</SelectItem>
                                <SelectItem value="preheader">Preheader Text</SelectItem>
                                <SelectItem value="button_text">Button Text</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaignContext"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Context</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your newsletter campaign, story topic, or announcement..."
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Local residents, community leaders, subscribers..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mainGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Main Goal</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Increase readership, drive donations, boost engagement..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="existingText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Text (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your existing text to optimize..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating Options...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Generate Optimized Content
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Generated Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Generated Options
                    {generatedOptions.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {generatedOptions.length} options
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedOptions.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No options generated yet</p>
                      <p className="text-sm text-slate-400">Fill out the form and click generate to see optimized content</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedOptions.map((option, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className={`w-2 h-2 rounded-full mr-2 ${getScoreColor(option.score)}`}></div>
                                <Badge variant="outline" className="text-xs">
                                  {option.category}
                                </Badge>
                                <span className="ml-2 text-sm font-medium text-slate-600">
                                  Score: {option.score}/100
                                </span>
                              </div>
                              <p className="text-lg font-medium text-slate-900 mb-2">
                                "{option.text}"
                              </p>
                              <p className="text-sm text-slate-600">
                                {option.reasoning}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(option.text)}
                              className="ml-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tips Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Email Marketing Tips for Nonprofit News</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Subject Lines</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Keep under 50 characters</li>
                      <li>• Create urgency without being clickbait</li>
                      <li>• Include local relevance</li>
                      <li>• Avoid spam trigger words</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Preheader Text</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Complement, don't repeat subject line</li>
                      <li>• 90-130 characters optimal</li>
                      <li>• Provide additional context</li>
                      <li>• End with compelling hook</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Button Text</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Use action-oriented verbs</li>
                      <li>• Keep to 2-5 words</li>
                      <li>• Be specific about outcome</li>
                      <li>• Create sense of value</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}