import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, RefreshCw, Mail, Lightbulb } from "lucide-react";

interface CampaignMessageCardProps {
  campaign: {
    subjectLine: string;
    body: string;
    cta: {
      text: string;
      url?: string;
    };
    followUpSuggestion?: string;
  };
  onSave?: () => void;
  onExport?: () => void;
  onRegenerate?: () => void;
  isSaving?: boolean;
}

export function CampaignMessageCard({ 
  campaign, 
  onSave, 
  onExport, 
  onRegenerate,
  isSaving = false 
}: CampaignMessageCardProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Generated Campaign</CardTitle>
          <Badge variant="secondary" className="ml-auto">Email</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject Line */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Subject Line
          </label>
          <p className="text-sm font-medium leading-relaxed break-words">{campaign.subjectLine}</p>
        </div>

        {/* Body */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Email Body
          </label>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words bg-muted/50 p-3 rounded-md overflow-hidden">
            {campaign.body}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Call to Action
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium break-words">{campaign.cta.text}</span>
            {campaign.cta.url && (
              <span className="text-xs text-muted-foreground break-all">→ {campaign.cta.url}</span>
            )}
          </div>
        </div>

        {/* Follow-up Suggestion */}
        {campaign.followUpSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-900 mb-1">Next Step</p>
                <p className="text-sm text-blue-700 break-words">{campaign.followUpSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            size="sm"
            className="flex-1 min-w-[100px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Campaign"}
          </Button>
          <Button 
            onClick={onExport} 
            variant="outline" 
            size="sm"
            className="flex-1 min-w-[100px]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={onRegenerate} 
            variant="outline" 
            size="sm"
            className="flex-1 min-w-[100px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
