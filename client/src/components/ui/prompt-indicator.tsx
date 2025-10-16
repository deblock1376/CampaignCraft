import { Badge } from "@/components/ui/badge";
import { shouldShowPromptIndicators } from "@/lib/admin-utils";
import { FileText } from "lucide-react";

interface PromptIndicatorProps {
  promptKey?: string;
  className?: string;
}

export function PromptIndicator({ promptKey, className = "" }: PromptIndicatorProps) {
  // Only show for admin users
  if (!shouldShowPromptIndicators() || !promptKey) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className={`bg-purple-50 text-purple-700 border-purple-300 font-mono text-xs ${className}`}
    >
      <FileText className="w-3 h-3 mr-1" />
      {promptKey}
    </Badge>
  );
}
