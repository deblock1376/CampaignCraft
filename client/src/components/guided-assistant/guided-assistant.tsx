import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Zap, 
  Users, 
  Mail, 
  MousePointer, 
  BookOpen,
  Target,
  MessageSquare,
  Settings,
  Bot,
  Sparkles
} from "lucide-react";
import GroundingLibraryForm, { GroundingLibraryMaterials } from "@/components/grounding-library/grounding-library-form";

export interface AssistantStep {
  id: string;
  title: string;
  description: string;
  optional?: boolean;
  completed: boolean;
}

export interface AssistantGoal {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: AssistantStep[];
  estimatedTime: string;
  category: 'campaign' | 'content' | 'setup';
  directLink?: string;
}

interface GuidedAssistantProps {
  onToolSelect?: (toolId: string, toolTitle: string, toolDescription: string, toolIcon: string) => void;
}

interface WizardState {
  breakingNews: {
    fullArticle: string;
    aiModel: string;
    generatedSummary: string;
    urgency: string;
    brandStylesheetId: string;
  };
  audienceTargeting: {
    campaignId: string;
    segments: Array<{ name: string; description: string }>;
  };
  emailOptimization: {
    context: string;
    campaignType: string;
    objective: string;
  };
  brandSetup: {
    newsroomInfo: string;
    name: string;
    materials: GroundingLibraryMaterials;
  };
}

export default function GuidedAssistant({ onToolSelect }: GuidedAssistantProps) {
  const [, setLocation] = useLocation();
  const [currentGoal, setCurrentGoal] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [wizardState, setWizardState] = useState<WizardState>({
    breakingNews: { fullArticle: '', aiModel: 'claude-sonnet-4', generatedSummary: '', urgency: 'high', brandStylesheetId: '' },
    audienceTargeting: { campaignId: '', segments: [{ name: '', description: '' }] },
    emailOptimization: { context: '', campaignType: 'email', objective: 'engagement' },
    brandSetup: { 
      newsroomInfo: '', 
      name: '',
      materials: {
        brandFoundation: {},
        campaignExamples: {},
        audienceIntelligence: {},
        performanceData: {}
      }
    }
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  const isAdmin = user.email === 'admin@campaigncraft.com';
  const { toast } = useToast();

  const { data: brandStylesheets } = useQuery({
    queryKey: isAdmin ? ["/api/brand-stylesheets"] : ["/api/newsrooms", newsroomId, "stylesheets"],
    enabled: !!newsroomId,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
    enabled: !!newsroomId,
  });

  // Article summarization mutation
  const summarizeArticleMutation = useMutation({
    mutationFn: async (data: { article: string; aiModel: string }) => {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/quickstart/summarize-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (result) => {
      updateWizardState('breakingNews', { generatedSummary: result.summary });
      toast({
        title: "Summary Generated!",
        description: "Article summary has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Summarization Failed",
        description: error.message || "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Campaign generation mutation
  const generateCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/quickstart/rapid-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (campaign) => {
      // Invalidate campaigns cache to refresh Recent Campaigns
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "campaigns"] });
      
      toast({
        title: "Campaign Generated Successfully!",
        description: `"${campaign.title}" has been created and added to your Recent Campaigns.`,
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

  const goals: AssistantGoal[] = [
    {
      id: 'campaign-builder',
      title: 'Campaign Builder',
      description: 'Chat with AI to create campaigns step-by-step with personalized guidance',
      icon: Bot,
      category: 'campaign',
      estimatedTime: '5-10 minutes',
      directLink: '/campaigns/assistant-test',
      steps: []
    },
    {
      id: 'breaking-news',
      title: 'Breaking News Campaign',
      description: 'Create urgent campaigns for breaking news stories',
      icon: Zap,
      category: 'campaign',
      estimatedTime: '3-5 minutes',
      steps: [
        {
          id: 'input-article',
          title: 'Add Full Article & Choose AI Model',
          description: 'Paste your complete news article and select the AI model for processing',
          completed: false
        },
        {
          id: 'generate-summary',
          title: 'Generate Article Summary',
          description: 'AI will create a concise summary of your article for the campaign',
          completed: false
        },
        {
          id: 'review-urgency',
          title: 'Review Summary & Set Urgency',
          description: 'Review the generated summary and set the campaign urgency level',
          completed: false
        },
        {
          id: 'choose-guidelines',
          title: 'Select Brand Guidelines (Optional)', 
          description: 'Choose existing brand guidelines to maintain consistency',
          optional: true,
          completed: false
        },
        {
          id: 'generate-campaign',
          title: 'Generate & Review Campaign',
          description: 'Generate your complete breaking news campaign using the summary',
          completed: false
        }
      ]
    },
    {
      id: 'audience-targeting',
      title: 'Target Different Audiences',
      description: 'Adapt existing campaigns for specific audience segments',
      icon: Users,
      category: 'campaign',
      estimatedTime: '4-6 minutes',
      steps: [
        {
          id: 'select-campaign',
          title: 'Choose Your Source Campaign',
          description: 'Select an existing campaign to adapt for different audiences',
          completed: false
        },
        {
          id: 'define-segments',
          title: 'Define Your Audience Segments',
          description: 'Create specific audience groups you want to target',
          completed: false
        },
        {
          id: 'generate-variations',
          title: 'Generate & Review Variations',
          description: 'Create customized campaign versions for each segment',
          completed: false
        }
      ]
    },
    {
      id: 'email-optimization',
      title: 'Optimize Email Performance',
      description: 'Create compelling subject lines and CTAs for better engagement',
      icon: Mail,
      category: 'content',
      estimatedTime: '2-4 minutes',
      steps: [
        {
          id: 'define-context',
          title: 'Define Your Campaign Context',
          description: 'Provide details about your email campaign goals and settings',
          completed: false
        },
        {
          id: 'generate-subjects',
          title: 'Generate Subject Lines',
          description: 'Create multiple compelling subject line options',
          completed: false
        },
        {
          id: 'create-ctas',
          title: 'Generate Call-to-Action Buttons',
          description: 'Create persuasive CTA text that drives clicks',
          completed: false
        }
      ]
    },
    {
      id: 'brand-setup',
      title: 'Build Grounding Library',
      description: 'Create a comprehensive grounding library with brand voice, style guides, and reference materials',
      icon: BookOpen,
      category: 'setup',
      estimatedTime: '5-7 minutes',
      steps: [
        {
          id: 'collect-content',
          title: 'Add Reference Materials',
          description: 'Add your brand voice, mission, style guides, and other reference materials',
          completed: false
        },
        {
          id: 'name-library',
          title: 'Name Your Library',
          description: 'Give your grounding library a meaningful name',
          completed: false
        },
        {
          id: 'generate-guidelines',
          title: 'Generate Grounding Library',
          description: 'Create your comprehensive grounding library for consistent brand messaging',
          completed: false
        }
      ]
    }
  ];

  const selectedGoal = goals.find(g => g.id === currentGoal);
  const progressPercentage = selectedGoal ? (completedSteps.length / selectedGoal.steps.length) * 100 : 0;

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => prev.includes(stepId) ? prev : [...prev, stepId]);
  };

  const resetAssistant = () => {
    setCurrentGoal(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    setWizardState({
      breakingNews: { fullArticle: '', aiModel: 'claude-sonnet-4', generatedSummary: '', urgency: 'high', brandStylesheetId: '' },
      audienceTargeting: { campaignId: '', segments: [{ name: '', description: '' }] },
      emailOptimization: { context: '', campaignType: 'email', objective: 'engagement' },
      brandSetup: { 
        newsroomInfo: '', 
        name: '',
        materials: {
          brandFoundation: {},
          campaignExamples: {},
          audienceIntelligence: {},
          performanceData: {}
        }
      }
    });
  };

  const nextStep = () => {
    if (selectedGoal && currentStep < selectedGoal.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateWizardState = (goalId: string, updates: any) => {
    setWizardState(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId as keyof WizardState], ...updates }
    }));
  };

  const isStepValid = (goalId: string, stepId: string): boolean => {
    const stateKeyMap: Record<string, keyof WizardState> = {
      'breaking-news': 'breakingNews',
      'audience-targeting': 'audienceTargeting', 
      'email-optimization': 'emailOptimization',
      'brand-setup': 'brandSetup'
    };

    const stateKey = stateKeyMap[goalId];
    const state = stateKey ? wizardState[stateKey] : null;
    
    if (!state) return false;
    
    switch (goalId) {
      case 'breaking-news':
        const breakingNewsState = state as typeof wizardState.breakingNews;
        if (stepId === 'input-article') return breakingNewsState.fullArticle.length > 0 && breakingNewsState.aiModel.length > 0;
        if (stepId === 'generate-summary') return breakingNewsState.fullArticle.length > 0 && breakingNewsState.aiModel.length > 0;
        if (stepId === 'review-urgency') return breakingNewsState.generatedSummary.length > 0;
        if (stepId === 'choose-guidelines') return true; // Optional step
        if (stepId === 'generate-campaign') return breakingNewsState.generatedSummary.length > 0;
        break;
      case 'audience-targeting':
        const audienceState = state as typeof wizardState.audienceTargeting;
        if (stepId === 'select-campaign') return audienceState.campaignId.length > 0;
        if (stepId === 'define-segments') return audienceState.segments.some((s: any) => s.name && s.description);
        if (stepId === 'generate-variations') return true;
        break;
      case 'email-optimization':
        const emailState = state as typeof wizardState.emailOptimization;
        if (stepId === 'define-context') return emailState.context.length > 0;
        if (stepId === 'generate-subjects') return true;
        if (stepId === 'create-ctas') return true;
        break;
      case 'brand-setup':
        const brandState = state as typeof wizardState.brandSetup;
        if (stepId === 'collect-content') {
          // Check if any materials have been added
          const materials = brandState.materials;
          const hasAnyMaterial = Object.values(materials).some(category => 
            Object.values(category).some((material: any) => material?.text || material?.fileUrl)
          );
          return hasAnyMaterial;
        }
        if (stepId === 'name-library') return brandState.name.trim().length > 0;
        if (stepId === 'generate-guidelines') return true;
        break;
    }
    return false;
  };

  const executeCurrentStep = async () => {
    if (selectedGoal) {
      const step = selectedGoal.steps[currentStep];
      
      // Handle Breaking News workflow steps
      if (selectedGoal.id === 'breaking-news') {
        if (step.id === 'generate-summary') {
          const breakingNewsState = wizardState.breakingNews;
          summarizeArticleMutation.mutate({
            article: breakingNewsState.fullArticle,
            aiModel: breakingNewsState.aiModel
          });
        } else if (step.id === 'generate-campaign') {
        const breakingNewsState = wizardState.breakingNews;
        
        // Generate campaign with collected data
        const campaignData = {
          articleSummary: breakingNewsState.generatedSummary, // Use generated summary
          aiModel: breakingNewsState.aiModel, // Use selected AI model
          urgency: breakingNewsState.urgency,
          newsroomId: newsroomId,
          brandStylesheetId: breakingNewsState.brandStylesheetId ? parseInt(breakingNewsState.brandStylesheetId) : null,
        };
        
        generateCampaignMutation.mutate(campaignData);
        }
      }
      
      // Handle Brand Setup workflow steps
      if (selectedGoal.id === 'brand-setup') {
        if (step.id === 'generate-guidelines') {
          const brandState = wizardState.brandSetup;
          const token = localStorage.getItem("token");
          
          try {
            const response = await fetch('/api/quickstart/grounding-library', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                newsroomId,
                name: brandState.name,
                materials: brandState.materials
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Request failed: ${response.status}`);
            }
            
            const stylesheet = await response.json();
            
            toast({
              title: "Grounding Library Created!",
              description: `"${stylesheet.name}" has been created successfully.`,
            });
            
            // Invalidate brand stylesheets cache to refresh the list
            queryClient.invalidateQueries({ queryKey: ["/api/brand-stylesheets"] });
          } catch (error: any) {
            toast({
              title: "Generation Failed",
              description: error.message || "Failed to generate grounding library. Please try again.",
              variant: "destructive",
            });
            return; // Don't mark as completed if it failed
          }
        }
      }
      
      // Mark step as completed
      markStepCompleted(step.id);
      
      // Advance to next step or complete workflow
      if (currentStep < selectedGoal.steps.length - 1) {
        nextStep();
      }
    }
  };

  const renderStepForm = (goalId: string, stepId: string) => {
    // Map goal IDs to wizard state keys
    const stateKeyMap: Record<string, keyof WizardState> = {
      'breaking-news': 'breakingNews',
      'audience-targeting': 'audienceTargeting', 
      'email-optimization': 'emailOptimization',
      'brand-setup': 'brandSetup'
    };

    const stateKey = stateKeyMap[goalId];
    const state = stateKey ? wizardState[stateKey] : null;

    if (!state) {
      return <div>Loading form...</div>;
    }

    switch (goalId) {
      case 'breaking-news':
        const breakingNewsState = state as typeof wizardState.breakingNews;
        
        if (stepId === 'input-article') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullArticle">Full News Article *</Label>
                <Textarea
                  id="fullArticle"
                  value={breakingNewsState.fullArticle}
                  onChange={(e) => updateWizardState(stateKey, { fullArticle: e.target.value })}
                  placeholder="Paste your complete news article here..."
                  rows={8}
                  data-testid="textarea-full-article"
                />
              </div>
              <div>
                <Label htmlFor="aiModel">AI Model *</Label>
                <Select 
                  value={breakingNewsState.aiModel} 
                  onValueChange={(value) => updateWizardState(stateKey, { aiModel: value })}
                >
                  <SelectTrigger data-testid="select-ai-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4">Claude Sonnet 4 (Recommended)</SelectItem>
                    <SelectItem value="gpt-5">GPT-5</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }
        
        if (stepId === 'generate-summary') {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Ready to Generate Summary</h4>
                <p className="text-blue-700 text-sm">AI will analyze your article and create a concise summary for the campaign using {breakingNewsState.aiModel}.</p>
                <div className="mt-3 text-xs text-blue-600">
                  <strong>Article length:</strong> {breakingNewsState.fullArticle.split(' ').length} words
                </div>
              </div>
            </div>
          );
        }
        
        if (stepId === 'review-urgency') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="generatedSummary">Generated Summary</Label>
                <Textarea
                  id="generatedSummary"
                  value={breakingNewsState.generatedSummary}
                  onChange={(e) => updateWizardState(stateKey, { generatedSummary: e.target.value })}
                  placeholder="AI-generated summary will appear here..."
                  rows={4}
                  data-testid="textarea-generated-summary"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select 
                  value={breakingNewsState.urgency} 
                  onValueChange={(value) => updateWizardState(stateKey, { urgency: value })}
                >
                  <SelectTrigger data-testid="select-urgency">
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
            </div>
          );
        }
        
        if (stepId === 'choose-guidelines') {
          return (
            <div>
              <Label htmlFor="brandStylesheet">Brand Guidelines (Optional)</Label>
              <Select 
                value={breakingNewsState.brandStylesheetId} 
                onValueChange={(value) => updateWizardState(stateKey, { brandStylesheetId: value })}
              >
                <SelectTrigger data-testid="select-brand-guidelines">
                  <SelectValue placeholder="Choose brand guidelines..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(brandStylesheets) ? brandStylesheets.map((sheet: any) => (
                    <SelectItem key={sheet.id} value={sheet.id.toString()}>
                      {sheet.name}
                    </SelectItem>
                  )) : (
                    <SelectItem value="none" disabled>No guidelines available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (stepId === 'generate-campaign') {
          return (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Review Your Campaign Details:</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Article Summary:</span> {breakingNewsState.generatedSummary}</p>
                <p><span className="font-medium">AI Model:</span> {breakingNewsState.aiModel}</p>
                <p><span className="font-medium">Urgency:</span> {breakingNewsState.urgency}</p>
                {breakingNewsState.brandStylesheetId && (
                  <p><span className="font-medium">Brand Guidelines:</span> Selected</p>
                )}
              </div>
            </div>
          );
        }
        break;

      case 'audience-targeting':
        const audienceState = state as typeof wizardState.audienceTargeting;
        
        if (stepId === 'select-campaign') {
          return (
            <div>
              <Label htmlFor="campaign">Source Campaign *</Label>
              <Select 
                value={audienceState.campaignId} 
                onValueChange={(value) => updateWizardState(stateKey, { campaignId: value })}
              >
                <SelectTrigger data-testid="select-source-campaign">
                  <SelectValue placeholder="Choose campaign to rewrite..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(campaigns) && campaigns.length > 0 ? (
                    campaigns.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No campaigns available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (stepId === 'define-segments') {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Audience Segments *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSegments = [...audienceState.segments, { name: '', description: '' }];
                    updateWizardState(stateKey, { segments: newSegments });
                  }}
                  data-testid="button-add-segment"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Add Segment
                </Button>
              </div>
              {audienceState.segments.map((segment, index) => (
                <Card key={index} className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Segment name (e.g., Young Professionals)"
                      value={segment.name}
                      onChange={(e) => {
                        const newSegments = [...audienceState.segments];
                        newSegments[index].name = e.target.value;
                        updateWizardState(stateKey, { segments: newSegments });
                      }}
                      data-testid={`input-segment-name-${index}`}
                    />
                    {audienceState.segments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSegments = audienceState.segments.filter((_, i) => i !== index);
                          updateWizardState(stateKey, { segments: newSegments });
                        }}
                        data-testid={`button-remove-segment-${index}`}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Describe this audience segment's characteristics..."
                    value={segment.description}
                    onChange={(e) => {
                      const newSegments = [...audienceState.segments];
                      newSegments[index].description = e.target.value;
                      updateWizardState(stateKey, { segments: newSegments });
                    }}
                    data-testid={`textarea-segment-description-${index}`}
                  />
                </Card>
              ))}
            </div>
          );
        }

        if (stepId === 'generate-variations') {
          const selectedCampaign = Array.isArray(campaigns) ? campaigns.find((c: any) => c.id.toString() === audienceState.campaignId) : null;
          return (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Review Your Segment Targeting:</h4>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Source Campaign:</span> {selectedCampaign?.title || 'Not selected'}</p>
                <div>
                  <span className="font-medium">Target Segments:</span>
                  <ul className="mt-1 space-y-1">
                    {audienceState.segments.filter(s => s.name && s.description).map((segment, index) => (
                      <li key={index} className="pl-2">• {segment.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        }
        break;

      case 'email-optimization':
        const emailState = state as typeof wizardState.emailOptimization;
        
        if (stepId === 'define-context') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="context">Campaign Context *</Label>
                <Textarea
                  id="context"
                  value={emailState.context}
                  onChange={(e) => updateWizardState(stateKey, { context: e.target.value })}
                  placeholder="Describe what your email campaign is about..."
                  rows={3}
                  data-testid="textarea-email-context"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select 
                    value={emailState.campaignType} 
                    onValueChange={(value) => updateWizardState(stateKey, { campaignType: value })}
                  >
                    <SelectTrigger data-testid="select-campaign-type">
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
                  <Select 
                    value={emailState.objective} 
                    onValueChange={(value) => updateWizardState(stateKey, { objective: value })}
                  >
                    <SelectTrigger data-testid="select-objective">
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
        }

        if (stepId === 'generate-subjects') {
          return (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Ready to Generate Subject Lines</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Context:</span> {emailState.context}</p>
                <p><span className="font-medium">Type:</span> {emailState.campaignType}</p>
                <p><span className="font-medium">Objective:</span> {emailState.objective}</p>
              </div>
            </div>
          );
        }

        if (stepId === 'create-ctas') {
          return (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Ready to Generate Call-to-Action Buttons</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Context:</span> {emailState.context}</p>
                <p><span className="font-medium">Type:</span> {emailState.campaignType}</p>
                <p><span className="font-medium">Objective:</span> {emailState.objective}</p>
              </div>
            </div>
          );
        }
        break;

      case 'brand-setup':
        const brandState = state as typeof wizardState.brandSetup;
        
        if (stepId === 'collect-content') {
          const handleFileUpload = async (category: string, field: string, file: File): Promise<string> => {
            try {
              // Get upload URL from API
              const response = await apiRequest("POST", "/api/objects/upload");
              const data = await response.json();
              
              // Upload file directly to the presigned URL
              const uploadResponse = await fetch(data.uploadURL, {
                method: "PUT",
                body: file,
                headers: {
                  'Content-Type': file.type || 'application/octet-stream',
                },
              });
              
              if (!uploadResponse.ok) {
                throw new Error("File upload failed");
              }
              
              // Return the upload URL (without query params) as the file URL
              const fileUrl = data.uploadURL.split('?')[0];
              
              toast({
                title: "File uploaded",
                description: `${file.name} has been uploaded successfully`,
              });
              
              return fileUrl;
            } catch (error) {
              toast({
                title: "Upload failed",
                description: "Failed to upload file. Please try again.",
                variant: "destructive",
              });
              throw error;
            }
          };

          return (
            <div>
              <GroundingLibraryForm
                materials={brandState.materials}
                onChange={(newMaterials) => updateWizardState(stateKey, { materials: newMaterials })}
                onFileUpload={handleFileUpload}
              />
            </div>
          );
        }

        if (stepId === 'name-library') {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="library-name">Library Name</Label>
                <Input
                  id="library-name"
                  placeholder="e.g., Q4 2024 Brand Guidelines, News Campaign Library, etc."
                  value={brandState.name}
                  onChange={(e) => updateWizardState(stateKey, { name: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Give your grounding library a descriptive name to easily identify it later.
                </p>
              </div>
            </div>
          );
        }

        if (stepId === 'generate-guidelines') {
          const materialsCount = Object.values(brandState.materials).reduce((count, category) => 
            count + Object.values(category).filter((material: any) => material?.text || material?.fileUrl).length, 
            0
          );
          return (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Ready to Create Your Grounding Library</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Library Name:</span> {brandState.name}</p>
                {materialsCount > 0 && (
                  <p><span className="font-medium">Reference Materials:</span> {materialsCount} items added</p>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">Your grounding library will help ensure consistent brand messaging across all campaigns.</p>
            </div>
          );
        }
        break;
    }

    return <div>Form not implemented for this step.</div>;
  };

  if (!currentGoal) {
    const campaignBuilder = goals.find(g => g.id === 'campaign-builder');
    const otherGoals = goals.filter(g => g.id !== 'campaign-builder');

    return (
      <div className="space-y-6">
        {/* Campaign Builder - Featured Card with Gradient */}
        {campaignBuilder && (() => {
          const Icon = campaignBuilder.icon;
          return (
            <Card key={campaignBuilder.id} className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group border-2 border-primary/20">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10" />
              
              {/* Recommended Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-md">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>

              <CardHeader className="relative pb-3">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{campaignBuilder.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1.5 bg-white/50">
                      {campaignBuilder.estimatedTime}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{campaignBuilder.description}</p>
              </CardHeader>
              <CardContent className="relative pt-0">
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-md group-hover:shadow-lg transition-all" 
                  size="lg"
                  onClick={() => {
                    if (campaignBuilder.directLink) {
                      setLocation(campaignBuilder.directLink);
                    } else {
                      setCurrentGoal(campaignBuilder.id);
                    }
                  }}
                  data-testid={`goal-${campaignBuilder.id}`}
                >
                  {campaignBuilder.directLink ? 'Open Builder' : 'Start Guide'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })()}

        {/* Other Goals - Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherGoals.map((goal) => {
            const Icon = goal.icon;
            return (
              <Card key={goal.id} className="cursor-pointer hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      goal.category === 'campaign' ? 'bg-blue-100 text-blue-600' :
                      goal.category === 'content' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{goal.title}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {goal.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (goal.directLink) {
                        setLocation(goal.directLink);
                      } else {
                        setCurrentGoal(goal.id);
                      }
                    }}
                    data-testid={`goal-${goal.id}`}
                  >
                    {goal.directLink ? 'Open Assistant' : 'Start Guide'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            Need help with something else? You can always access individual tools from the Quick Start Templates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={resetAssistant}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Menu
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{selectedGoal?.title}</h2>
          <p className="text-sm text-gray-600">Step {currentStep + 1} of {selectedGoal?.steps.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="text-gray-600">{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {selectedGoal?.steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`p-3 rounded-lg border ${
              index === currentStep ? 'border-primary bg-primary/5' :
              completedSteps.includes(step.id) ? 'border-green-200 bg-green-50' :
              'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {completedSteps.includes(step.id) ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <div className={`w-4 h-4 rounded-full border ${
                  index === currentStep ? 'border-primary bg-primary' : 'border-gray-300'
                }`} />
              )}
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Current Step Detail */}
      {selectedGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {selectedGoal.steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{selectedGoal.steps[currentStep].description}</p>
            
            {/* Step Form Content */}
            <div className="space-y-4">
              {renderStepForm(selectedGoal.id, selectedGoal.steps[currentStep].id)}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={executeCurrentStep}
                disabled={completedSteps.includes(selectedGoal.steps[currentStep].id) || !isStepValid(selectedGoal.id, selectedGoal.steps[currentStep].id) || generateCampaignMutation.isPending}
                className="flex-1"
                data-testid={`execute-step-${selectedGoal.steps[currentStep].id}`}
              >
                {completedSteps.includes(selectedGoal.steps[currentStep].id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : generateCampaignMutation.isPending && selectedGoal.id === 'breaking-news' && selectedGoal.steps[currentStep].id === 'generate-campaign' ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2 animate-spin" />
                    Generating Campaign...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {currentStep === selectedGoal.steps.length - 1 ? 'Generate' : 'Continue'}
                  </>
                )}
              </Button>
              
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              
              {currentStep < selectedGoal.steps.length - 1 && completedSteps.includes(selectedGoal.steps[currentStep].id) && (
                <Button variant="outline" onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {completedSteps.length === selectedGoal.steps.length && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Goal Complete!
                </div>
                <p className="text-green-700 text-sm mb-3">
                  You've successfully completed all steps for {selectedGoal.title.toLowerCase()}. 
                  Your content has been generated and is ready to use.
                </p>
                <Button onClick={resetAssistant} variant="outline" size="sm">
                  Start Another Goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}