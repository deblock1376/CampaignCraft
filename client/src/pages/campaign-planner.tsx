import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Calendar, Loader2, FileText, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

interface CampaignPlan {
  id: number;
  title: string;
  inputs: any;
  generatedPlan: string;
  aiModel: string;
  createdAt: string;
  updatedAt: string;
}

export default function CampaignPlanner() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user?.newsroomId || 1;
  const { toast } = useToast();

  const [view, setView] = useState<"form" | "list" | "view">("list");
  const [selectedPlan, setSelectedPlan] = useState<CampaignPlan | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [organizationProfile, setOrganizationProfile] = useState("");
  const [brandVoice, setBrandVoice] = useState("AP Style");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [totalGoal, setTotalGoal] = useState("");
  const [timeframeType, setTimeframeType] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [audienceNotes, setAudienceNotes] = useState("");
  const [keyStories, setKeyStories] = useState("");
  const [matchDetails, setMatchDetails] = useState("");
  const [constraints, setConstraints] = useState("");
  const [tools, setTools] = useState("");
  const [aiModel, setAiModel] = useState("gpt-5");

  const { data: plans = [], refetch } = useQuery({
    queryKey: [`/api/newsrooms/${newsroomId}/campaign-plans`],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/campaign-plans`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch campaign plans");
      }
      return response.json();
    },
    enabled: !!newsroomId,
  });

  const createPlanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/campaign-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newsroomId,
          title: title || "Campaign Plan",
          inputs: {
            organizationProfile,
            brandVoice,
            campaignGoal,
            totalGoal,
            timeframeType,
            startDate,
            endDate,
            audienceNotes,
            keyStories,
            matchDetails,
            constraints,
            tools,
          },
          aiModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate campaign plan");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Plan Generated",
        description: "Your campaign plan has been created successfully",
      });
      refetch();
      setSelectedPlan(data);
      setView("view");
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate campaign plan",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setOrganizationProfile("");
    setBrandVoice("AP Style");
    setCampaignGoal("");
    setTotalGoal("");
    setTimeframeType("month");
    setStartDate("");
    setEndDate("");
    setAudienceNotes("");
    setKeyStories("");
    setMatchDetails("");
    setConstraints("");
    setTools("");
    setAiModel("gpt-5");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for your campaign plan",
        variant: "destructive",
      });
      return;
    }
    createPlanMutation.mutate();
  };

  const handleViewPlan = (plan: CampaignPlan) => {
    setSelectedPlan(plan);
    setView("view");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {view === "list" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Campaign Planner</h1>
                    <p className="text-muted-foreground mt-1">
                      Map out fundraising campaigns with Lou, your AI campaign strategist
                    </p>
                  </div>
                  <Button onClick={() => setView("form")} size="lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Create New Plan
                  </Button>
                </div>

                {plans.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Campaign Plans Yet</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Create your first fundraising campaign plan with dated calendars, asset checklists, and starter copy.
                      </p>
                      <Button onClick={() => setView("form")}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Your First Plan
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {plans.map((plan: CampaignPlan) => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewPlan(plan)}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>{plan.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {new Date(plan.createdAt).toLocaleDateString()} • {plan.aiModel === 'gpt-5' ? 'GPT-5' : plan.aiModel === 'claude-sonnet-4' ? 'Claude Sonnet 4' : 'Gemini 2.5 Flash'}
                              </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                              View Plan
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "form" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setView("list")}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Plans
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold">Create Campaign Plan</h1>
                    <p className="text-muted-foreground mt-1">Lou will create a complete campaign roadmap based on your inputs</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Details</CardTitle>
                      <CardDescription>Provide information about your campaign. Lou will fill in any gaps.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Campaign Plan Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., 2024 End-of-Year NewsMatch Campaign"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="organizationProfile">Organization Profile</Label>
                          <Textarea
                            id="organizationProfile"
                            placeholder="Your newsroom's mission and value proposition..."
                            value={organizationProfile}
                            onChange={(e) => setOrganizationProfile(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="campaignGoal">Campaign Goal</Label>
                          <Textarea
                            id="campaignGoal"
                            placeholder="What do you want to achieve? (e.g., increase donations, monthly recurring, etc.)"
                            value={campaignGoal}
                            onChange={(e) => setCampaignGoal(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="totalGoal">Fundraising Goal</Label>
                          <Input
                            id="totalGoal"
                            placeholder="e.g., $50,000 or 100 new members"
                            value={totalGoal}
                            onChange={(e) => setTotalGoal(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="brandVoice">Brand Voice</Label>
                          <Input
                            id="brandVoice"
                            placeholder="e.g., AP Style, conversational, formal"
                            value={brandVoice}
                            onChange={(e) => setBrandVoice(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="timeframeType">Timeframe Type</Label>
                          <Select value={timeframeType} onValueChange={setTimeframeType}>
                            <SelectTrigger id="timeframeType">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="quarter">Quarter</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="audienceNotes">Audience Notes</Label>
                        <Textarea
                          id="audienceNotes"
                          placeholder="Describe your audience segments (e.g., non-donors, LYBUNT, recurring prospects)"
                          value={audienceNotes}
                          onChange={(e) => setAudienceNotes(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keyStories">Key Stories/Links (max 3)</Label>
                        <Textarea
                          id="keyStories"
                          placeholder="List up to 3 key stories or article links relevant to this campaign..."
                          value={keyStories}
                          onChange={(e) => setKeyStories(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="matchDetails">Match/Challenge Details</Label>
                          <Textarea
                            id="matchDetails"
                            placeholder="Any matching gift or challenge information..."
                            value={matchDetails}
                            onChange={(e) => setMatchDetails(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="constraints">Constraints</Label>
                          <Textarea
                            id="constraints"
                            placeholder="Send caps, blackout dates, or other limitations..."
                            value={constraints}
                            onChange={(e) => setConstraints(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="tools">Tools & Platforms</Label>
                          <Input
                            id="tools"
                            placeholder="e.g., Mailchimp, Salesforce, Google Analytics"
                            value={tools}
                            onChange={(e) => setTools(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="aiModel">AI Model</Label>
                          <Select value={aiModel} onValueChange={setAiModel}>
                            <SelectTrigger id="aiModel">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-5">GPT-5</SelectItem>
                              <SelectItem value="claude-sonnet-4">Claude Sonnet 4</SelectItem>
                              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setView("list")}>
                      Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={createPlanMutation.isPending}>
                      {createPlanMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-5 w-5 mr-2" />
                          Generate Campaign Plan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {view === "view" && selectedPlan && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setView("list")}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Plans
                  </Button>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">{selectedPlan.title}</h1>
                    <p className="text-muted-foreground mt-1">
                      Generated on {new Date(selectedPlan.createdAt).toLocaleDateString()} with {selectedPlan.aiModel === 'gpt-5' ? 'GPT-5' : selectedPlan.aiModel === 'claude-sonnet-4' ? 'Claude Sonnet 4' : 'Gemini 2.5 Flash'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = `/campaigns/assistant-test?planId=${selectedPlan.id}`}
                    size="lg"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Generate Campaign from This Plan
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-8">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>{selectedPlan.generatedPlan}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
