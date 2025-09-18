import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
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
  Settings
} from "lucide-react";

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
}

interface GuidedAssistantProps {
  onToolSelect?: (toolId: string, toolTitle: string, toolDescription: string, toolIcon: string) => void;
}

interface WizardState {
  breakingNews: {
    headline: string;
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
    existingContent: string;
  };
}

export default function GuidedAssistant({ onToolSelect }: GuidedAssistantProps) {
  const [currentGoal, setCurrentGoal] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [wizardState, setWizardState] = useState<WizardState>({
    breakingNews: { headline: '', urgency: 'high', brandStylesheetId: '' },
    audienceTargeting: { campaignId: '', segments: [{ name: '', description: '' }] },
    emailOptimization: { context: '', campaignType: 'email', objective: 'engagement' },
    brandSetup: { newsroomInfo: '', existingContent: '' }
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;

  const { data: brandStylesheets } = useQuery({
    queryKey: ["/api/brand-stylesheets", newsroomId],
    enabled: !!newsroomId,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
    enabled: !!newsroomId,
  });

  const goals: AssistantGoal[] = [
    {
      id: 'breaking-news',
      title: 'Breaking News Campaign',
      description: 'Create urgent campaigns for breaking news stories',
      icon: Zap,
      category: 'campaign',
      estimatedTime: '3-5 minutes',
      steps: [
        {
          id: 'prepare-headline',
          title: 'Enter Your Breaking News Headline',
          description: 'Provide the headline and set the urgency level for your campaign',
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
          description: 'Generate your complete breaking news campaign',
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
      title: 'Build Brand Guidelines',
      description: 'Create comprehensive brand guidelines for consistent messaging',
      icon: BookOpen,
      category: 'setup',
      estimatedTime: '5-7 minutes',
      steps: [
        {
          id: 'gather-info',
          title: 'Enter Newsroom Information',
          description: 'Provide details about your newsroom, mission, and audience',
          completed: false
        },
        {
          id: 'collect-content',
          title: 'Add Existing Content (Optional)',
          description: 'Share samples of your existing content for style analysis',
          optional: true,
          completed: false
        },
        {
          id: 'generate-guidelines',
          title: 'Generate & Review Guidelines',
          description: 'Create comprehensive brand guidelines using AI analysis',
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
      breakingNews: { headline: '', urgency: 'high', brandStylesheetId: '' },
      audienceTargeting: { campaignId: '', segments: [{ name: '', description: '' }] },
      emailOptimization: { context: '', campaignType: 'email', objective: 'engagement' },
      brandSetup: { newsroomInfo: '', existingContent: '' }
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
    const state = wizardState[goalId as keyof WizardState];
    
    switch (goalId) {
      case 'breaking-news':
        if (stepId === 'prepare-headline') return (state as any).headline.length > 0;
        if (stepId === 'choose-guidelines') return true; // Optional step
        if (stepId === 'generate-campaign') return true;
        break;
      case 'audience-targeting':
        if (stepId === 'select-campaign') return (state as any).campaignId.length > 0;
        if (stepId === 'define-segments') return (state as any).segments.some((s: any) => s.name && s.description);
        if (stepId === 'generate-variations') return true;
        break;
      case 'email-optimization':
        if (stepId === 'define-context') return (state as any).context.length > 0;
        if (stepId === 'generate-subjects') return true;
        if (stepId === 'create-ctas') return true;
        break;
      case 'brand-setup':
        if (stepId === 'gather-info') return (state as any).newsroomInfo.length > 0;
        if (stepId === 'collect-content') return true; // Optional step
        if (stepId === 'generate-guidelines') return true;
        break;
    }
    return false;
  };

  const executeCurrentStep = () => {
    if (selectedGoal) {
      const step = selectedGoal.steps[currentStep];
      
      // Mark step as completed
      markStepCompleted(step.id);
      
      // Advance to next step or complete workflow
      if (currentStep < selectedGoal.steps.length - 1) {
        nextStep();
      }
    }
  };

  const renderStepForm = (goalId: string, stepId: string) => {
    const state = wizardState[goalId as keyof WizardState];

    switch (goalId) {
      case 'breaking-news':
        const breakingNewsState = state as typeof wizardState.breakingNews;
        
        if (stepId === 'prepare-headline') {
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="headline">Breaking News Headline *</Label>
                <Input
                  id="headline"
                  value={breakingNewsState.headline}
                  onChange={(e) => updateWizardState('breakingNews', { headline: e.target.value })}
                  placeholder="Local mayor announces major infrastructure project"
                  data-testid="input-headline"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select 
                  value={breakingNewsState.urgency} 
                  onValueChange={(value) => updateWizardState('breakingNews', { urgency: value })}
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
                onValueChange={(value) => updateWizardState('breakingNews', { brandStylesheetId: value })}
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
                <p><span className="font-medium">Headline:</span> {breakingNewsState.headline}</p>
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
                onValueChange={(value) => updateWizardState('audienceTargeting', { campaignId: value })}
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
                    updateWizardState('audienceTargeting', { segments: newSegments });
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
                        updateWizardState('audienceTargeting', { segments: newSegments });
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
                          updateWizardState('audienceTargeting', { segments: newSegments });
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
                      updateWizardState('audienceTargeting', { segments: newSegments });
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
                  onChange={(e) => updateWizardState('emailOptimization', { context: e.target.value })}
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
                    onValueChange={(value) => updateWizardState('emailOptimization', { campaignType: value })}
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
                    onValueChange={(value) => updateWizardState('emailOptimization', { objective: value })}
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
        
        if (stepId === 'gather-info') {
          return (
            <div>
              <Label htmlFor="newsroomInfo">About Your Newsroom *</Label>
              <Textarea
                id="newsroomInfo"
                value={brandState.newsroomInfo}
                onChange={(e) => updateWizardState('brandSetup', { newsroomInfo: e.target.value })}
                placeholder="Tell us about your newsroom, mission, and audience..."
                rows={4}
                data-testid="textarea-newsroom-info"
              />
            </div>
          );
        }

        if (stepId === 'collect-content') {
          return (
            <div>
              <Label htmlFor="existingContent">Existing Content (Optional)</Label>
              <Textarea
                id="existingContent"
                value={brandState.existingContent}
                onChange={(e) => updateWizardState('brandSetup', { existingContent: e.target.value })}
                placeholder="Paste some existing content for AI to analyze your style..."
                rows={4}
                data-testid="textarea-existing-content"
              />
            </div>
          );
        }

        if (stepId === 'generate-guidelines') {
          return (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Ready to Generate Brand Guidelines</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Newsroom Info:</span> Provided</p>
                {brandState.existingContent && (
                  <p><span className="font-medium">Existing Content:</span> Provided for analysis</p>
                )}
              </div>
            </div>
          );
        }
        break;
    }

    return <div>Form not implemented for this step.</div>;
  };

  if (!currentGoal) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Marketing Assistant</h2>
          <p className="text-gray-600">Let's walk through creating your marketing content step by step. What would you like to create today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
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
                    onClick={() => setCurrentGoal(goal.id)}
                    data-testid={`goal-${goal.id}`}
                  >
                    Start Guide
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
          Back to Goals
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
                disabled={completedSteps.includes(selectedGoal.steps[currentStep].id) || !isStepValid(selectedGoal.id, selectedGoal.steps[currentStep].id)}
                className="flex-1"
                data-testid={`execute-step-${selectedGoal.steps[currentStep].id}`}
              >
                {completedSteps.includes(selectedGoal.steps[currentStep].id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
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