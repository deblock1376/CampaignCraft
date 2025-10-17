import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Target, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Save } from "lucide-react";
import { PromptIndicator } from "@/components/ui/prompt-indicator";

export default function CampaignEvaluate() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  const { toast } = useToast();
  const [location] = useLocation();

  const [campaignContent, setCampaignContent] = useState("");
  const [campaignType, setCampaignType] = useState("email");
  const [framework, setFramework] = useState<"bluelena" | "audience_value_prop">("bluelena");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const { data: campaigns } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
  });

  // Auto-populate campaign from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const encodedCampaign = searchParams.get('campaign');
    
    if (encodedCampaign) {
      try {
        const campaignData = JSON.parse(decodeURIComponent(encodedCampaign));
        
        // Build campaign content from the encoded data
        const content = `Subject: ${campaignData.subject || ''}\n\n${campaignData.body || ''}${campaignData.cta ? `\n\nCTA: ${campaignData.cta}` : ''}`;
        setCampaignContent(content);
        setCampaignType('email');
        
        toast({
          title: "Campaign Loaded",
          description: "Your campaign has been loaded for evaluation",
        });
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  }, [location, toast]);

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/campaigns/evaluate", {
        campaignContent,
        campaignType,
        framework,
        newsroomId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEvaluation(data);
      toast({
        title: "Evaluation Complete",
        description: "Your campaign has been evaluated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Evaluation Failed",
        description: "There was an error evaluating your campaign",
        variant: "destructive",
      });
    },
  });

  const rewriteMutation = useMutation({
    mutationFn: async (recommendations: string[]) => {
      const response = await apiRequest("POST", "/api/campaigns/ai-rewrite", {
        originalContent: campaignContent,
        recommendations,
        campaignType,
        newsroomId,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setCampaignContent(data.rewrittenContent);
      setShowSaveForm(true);
      toast({
        title: "Campaign Rewritten",
        description: "Your campaign has been improved with AI suggestions. Save it to your campaign library!",
      });
      setEvaluation(null);
    },
  });

  const saveCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/campaigns/save-evaluated", {
        title: campaignTitle || `Evaluated ${campaignType} Campaign`,
        content: campaignContent,
        type: campaignType,
        newsroomId,
        objective: 'engagement',
        context: `Evaluated and rewritten campaign using ${framework} framework`,
        aiModel: 'gpt-5',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "campaigns"] });
      toast({
        title: "Campaign Saved",
        description: "Your evaluated campaign has been saved successfully",
      });
      setCampaignContent("");
      setCampaignTitle("");
      setShowSaveForm(false);
    },
  });

  const handleEvaluate = () => {
    if (!campaignContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter campaign content to evaluate",
        variant: "destructive",
      });
      return;
    }
    evaluateMutation.mutate();
  };

  const handleRewrite = () => {
    if (evaluation?.recommendations) {
      rewriteMutation.mutate(evaluation.recommendations);
    }
  };

  const getCategoryColor = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getOverallColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRatingBadge = (rating?: string) => {
    if (!rating) return null;
    
    const normalizedRating = rating.trim().toLowerCase();
    
    // BlueLena ratings
    if (normalizedRating === "excellent") return "🟢 Excellent";
    if (normalizedRating === "good") return "🟡 Good";
    if (normalizedRating === "needs revision") return "🔴 Needs Revision";
    
    // Audience Value Proposition ratings
    if (normalizedRating.includes("strongly audience")) return "🟢 Strongly Audience-Centric";
    if (normalizedRating === "mixed") return "🟡 Mixed";
    if (normalizedRating.includes("organization")) return "🔴 Organization-Centric";
    
    return rating; // Fallback to show the rating as-is
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Campaign Evaluation" 
          subtitle="Get AI-powered feedback on your marketing campaigns"
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Campaign Details
                </CardTitle>
                <CardDescription>
                  Paste your campaign content below to receive expert analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-type">Campaign Type</Label>
                    <Select value={campaignType} onValueChange={setCampaignType}>
                      <SelectTrigger id="campaign-type" data-testid="select-campaign-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="web">Web Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="framework">Evaluation Framework</Label>
                    <Select value={framework} onValueChange={(val: any) => setFramework(val)}>
                      <SelectTrigger id="framework" data-testid="select-framework">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bluelena">BlueLena Best Practices</SelectItem>
                        <SelectItem value="audience_value_prop">Audience Value Proposition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-content">Campaign Content</Label>
                  <Textarea
                    id="campaign-content"
                    data-testid="input-campaign-content"
                    placeholder="Paste your email subject line, body text, social post, or web content here..."
                    value={campaignContent}
                    onChange={(e) => setCampaignContent(e.target.value)}
                    className="min-h-[200px] text-sm"
                  />
                </div>
                <Button 
                  onClick={handleEvaluate} 
                  disabled={evaluateMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-evaluate"
                >
                  {evaluateMutation.isPending ? (
                    <>
                      <span className="mr-2">Analyzing...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Evaluate Campaign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Evaluation Results */}
            {evaluation && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                        {framework === "bluelena" ? "BlueLena Best Practices Score" : "Evaluation Results"}
                      </CardTitle>
                      <PromptIndicator promptKey={evaluation.promptKey} />
                    </div>
                    <div className="flex items-center gap-2">
                      {evaluation.rating && (
                        <Badge variant="outline" className="text-sm">
                          {getRatingBadge(evaluation.rating)}
                        </Badge>
                      )}
                      <Badge className={`${getOverallColor(evaluation.overallScore)} text-white`}>
                        {evaluation.overallScore}/100
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {framework === "bluelena" ? "BlueLena Framework Analysis" : "Audience Value Proposition Analysis"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Overall Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Performance</span>
                      <span className={getCategoryColor(evaluation.overallScore)}>
                        {evaluation.overallScore}/100
                      </span>
                    </div>
                    <Progress value={evaluation.overallScore} className="h-3" />
                  </div>

                  {/* Category Scores */}
                  {evaluation.categoryScores && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Score Breakdown</h4>
                      {Object.entries(evaluation.categoryScores).map(([category, score]: [string, any]) => {
                        const maxScore = framework === "bluelena" ? 20 : 2;
                        const percentage = (score / maxScore) * 100;
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                              <span className={getCategoryColor(score, maxScore)}>{score}/{maxScore}</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {evaluation.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm text-blue-900">Analysis</h4>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{evaluation.explanation}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {evaluation.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rewrite Offer */}
                  {evaluation.rewriteOffer && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-sm text-emerald-800">{evaluation.rewriteOffer}</p>
                    </div>
                  )}

                  {/* AI Rewrite Button */}
                  <Button 
                    onClick={handleRewrite}
                    disabled={rewriteMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                    data-testid="button-rewrite"
                  >
                    {rewriteMutation.isPending ? (
                      <>
                        <span className="mr-2">Rewriting...</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Apply AI Recommendations
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Save Campaign Form */}
            {showSaveForm && (
              <Card className="border-2 border-emerald-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Save className="h-5 w-5 mr-2 text-emerald-600" />
                    Save Improved Campaign
                  </CardTitle>
                  <CardDescription>
                    Save this AI-improved campaign to your campaign library
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-title">Campaign Title</Label>
                    <Input
                      id="campaign-title"
                      data-testid="input-campaign-title"
                      placeholder="Enter a title for this campaign"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => saveCampaignMutation.mutate()}
                      disabled={saveCampaignMutation.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      data-testid="button-save-campaign"
                    >
                      {saveCampaignMutation.isPending ? (
                        <>
                          <span className="mr-2">Saving...</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Library
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowSaveForm(false)}
                      disabled={saveCampaignMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
