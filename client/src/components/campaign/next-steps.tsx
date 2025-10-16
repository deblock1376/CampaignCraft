import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Users, 
  FileText,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";

interface NextStepsProps {
  campaign: {
    title: string;
    content: string;
    subject?: string;
    callToAction?: string;
  };
  context?: {
    objective?: string;
    segmentId?: number;
    segmentName?: string;
    groundingGuideIds?: number[];
    storySummaryIds?: number[];
    hasReferenceMaterials?: boolean;
  };
}

interface Suggestion {
  icon: any;
  title: string;
  description: string;
  action: () => void;
  variant?: "default" | "outline";
}

export function NextSteps({ campaign, context }: NextStepsProps) {
  const [, setLocation] = useLocation();

  const generateSmartSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Always add evaluation as first option
    suggestions.push({
      icon: CheckCircle,
      title: "Evaluate this campaign",
      description: "Get AI-powered feedback and improvement suggestions",
      action: () => {
        const encodedCampaign = encodeURIComponent(JSON.stringify({
          subject: campaign.subject || campaign.title,
          body: campaign.content,
          cta: campaign.callToAction || ""
        }));
        setLocation(`/campaigns/evaluate?campaign=${encodedCampaign}`);
      },
      variant: "default"
    });

    // Context-aware suggestions based on objective
    if (context?.objective === "donation") {
      suggestions.push({
        icon: Sparkles,
        title: "Create donor thank-you campaign",
        description: "Build a follow-up to thank supporters",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    } else if (context?.objective === "subscription") {
      suggestions.push({
        icon: TrendingUp,
        title: "Build win-back campaign",
        description: "Re-engage lapsed subscribers",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    } else if (context?.objective === "membership") {
      suggestions.push({
        icon: TrendingUp,
        title: "Create member welcome series",
        description: "Build onboarding for new members",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    } else if (context?.objective === "engagement") {
      suggestions.push({
        icon: FileText,
        title: "Amplify engagement with follow-up",
        description: "Keep readers engaged with related content",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    } else if (context?.objective === "event") {
      suggestions.push({
        icon: FileText,
        title: "Create event reminder",
        description: "Schedule a follow-up reminder campaign",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    }

    // Segment-based suggestions
    if (!context?.segmentId) {
      suggestions.push({
        icon: Users,
        title: "Target specific audiences",
        description: "Create versions for different segments",
        action: () => setLocation("/segments"),
        variant: "outline"
      });
    } else if (context?.segmentName) {
      suggestions.push({
        icon: Users,
        title: "Create variants for other segments",
        description: "Adapt this campaign for different audiences",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    }

    // Grounding guide suggestions
    if (!context?.groundingGuideIds || context.groundingGuideIds.length === 0) {
      suggestions.push({
        icon: BookOpen,
        title: "Add brand guidelines",
        description: "Strengthen consistency with grounding guides",
        action: () => setLocation("/grounding"),
        variant: "outline"
      });
    }

    // Story summary suggestions
    if (context?.storySummaryIds && context.storySummaryIds.length > 0) {
      suggestions.push({
        icon: FileText,
        title: "Create variations with different angles",
        description: "Try different story perspectives",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    }

    // Always add option to create another campaign
    if (suggestions.length < 4) {
      suggestions.push({
        icon: Sparkles,
        title: "Create another campaign",
        description: "Start a new campaign from scratch",
        action: () => setLocation("/campaigns/assistant-test"),
        variant: "outline"
      });
    }

    // Return max 3 suggestions
    return suggestions.slice(0, 3);
  };

  const suggestions = generateSmartSuggestions();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          What's next?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant={suggestion.variant}
            className="w-full justify-start h-auto py-3 px-4"
            onClick={suggestion.action}
          >
            <div className="flex items-start gap-3 w-full">
              <suggestion.icon className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-semibold">{suggestion.title}</div>
                <div className="text-sm opacity-80 font-normal">
                  {suggestion.description}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 mt-1 shrink-0 opacity-50" />
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
