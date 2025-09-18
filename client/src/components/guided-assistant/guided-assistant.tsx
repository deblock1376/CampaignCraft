import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  action: () => void;
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

export default function GuidedAssistant({ onToolSelect }: GuidedAssistantProps) {
  const [currentGoal, setCurrentGoal] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

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
          title: 'Prepare Your Breaking News Headline',
          description: 'Have your headline ready and determine the urgency level',
          action: () => {},
          completed: false
        },
        {
          id: 'choose-guidelines',
          title: 'Select Brand Guidelines (Optional)',
          description: 'Choose existing brand guidelines to maintain consistency',
          action: () => {},
          completed: false
        },
        {
          id: 'generate-campaign',
          title: 'Generate Rapid-Response Campaign',
          description: 'Use AI to create your complete breaking news campaign',
          action: () => onToolSelect?.('rapid-response', 'Create Rapid-Response Campaign', 'Generate breaking news campaigns in minutes with AI-powered content', 'fas fa-bolt'),
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
          description: 'Pick an existing campaign that you want to adapt',
          action: () => {},
          completed: false
        },
        {
          id: 'define-segments',
          title: 'Define Your Audience Segments',
          description: 'Identify the different audience groups you want to target',
          action: () => {},
          completed: false
        },
        {
          id: 'generate-variations',
          title: 'Generate Campaign Variations',
          description: 'Create customized versions for each audience segment',
          action: () => onToolSelect?.('rewrite-segments', 'Re-write Campaigns for Segments', 'Automatically adapt existing campaigns for different audience segments', 'fas fa-users'),
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
          description: 'Describe what your email campaign is about',
          action: () => {},
          completed: false
        },
        {
          id: 'generate-subjects',
          title: 'Generate Subject Lines',
          description: 'Create multiple compelling subject line options',
          action: () => onToolSelect?.('subject-lines', 'Suggest Subject Lines', 'Generate compelling email subject lines that boost open rates', 'fas fa-envelope'),
          completed: false
        },
        {
          id: 'create-ctas',
          title: 'Create Call-to-Action Buttons',
          description: 'Generate persuasive CTA text that drives clicks',
          action: () => onToolSelect?.('cta-buttons', 'Suggest Button CTAs', 'Create persuasive call-to-action buttons that drive conversions', 'fas fa-hand-pointer'),
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
          title: 'Gather Newsroom Information',
          description: 'Collect information about your newsroom, mission, and audience',
          action: () => {},
          completed: false
        },
        {
          id: 'collect-content',
          title: 'Collect Existing Content (Optional)',
          description: 'Provide samples of your existing content for style analysis',
          action: () => {},
          completed: false
        },
        {
          id: 'generate-guidelines',
          title: 'Generate Brand Guidelines',
          description: 'Create comprehensive brand guidelines using AI analysis',
          action: () => onToolSelect?.('grounding-library', 'Build a Grounding Library', 'Create comprehensive brand guidelines from your existing content', 'fas fa-book'),
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

  const executeCurrentStep = () => {
    if (selectedGoal) {
      const step = selectedGoal.steps[currentStep];
      step.action();
      markStepCompleted(step.id);
      if (currentStep < selectedGoal.steps.length - 1) {
        nextStep();
      }
    }
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
            
            <div className="flex gap-3">
              <Button 
                onClick={executeCurrentStep}
                disabled={completedSteps.includes(selectedGoal.steps[currentStep].id)}
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
                    {currentStep === selectedGoal.steps.length - 1 ? 'Complete' : 'Continue'}
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