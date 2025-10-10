import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Check, Sparkles, Save } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DraftCarouselProps {
  drafts: any[];
  onMerge?: (mergedCampaign: any) => void;
}

export default function DraftCarousel({ drafts, onMerge }: DraftCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<number[]>([]);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;

  const currentDraft = drafts[currentIndex];

  const mergeMutation = useMutation({
    mutationFn: async (draftIds: number[]) => {
      const response = await apiRequest("POST", "/api/campaigns/merge-drafts", {
        draftIds,
        newsroomId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "campaigns"] });
      toast({
        title: "Drafts Merged Successfully",
        description: "Your selected campaign variations have been combined",
      });
      if (onMerge) {
        onMerge(data);
      }
    },
    onError: () => {
      toast({
        title: "Merge Failed",
        description: "There was an error merging the drafts",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (draftId: number) => {
      const response = await apiRequest("POST", "/api/campaigns/save-draft", {
        draftId,
        newsroomId,
      });
      return { savedCampaign: await response.json(), originalDraftId: draftId };
    },
    onSuccess: ({ originalDraftId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "campaigns"] });
      setSavedDrafts((prev) => [...prev, originalDraftId]);
      toast({
        title: "Draft Saved Successfully",
        description: "This variation has been saved to your campaigns",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "There was an error saving the draft",
        variant: "destructive",
      });
    },
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : drafts.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < drafts.length - 1 ? prev + 1 : 0));
  };

  const toggleSelection = (draftId: number) => {
    setSelectedDrafts((prev) =>
      prev.includes(draftId)
        ? prev.filter((id) => id !== draftId)
        : [...prev, draftId]
    );
  };

  const handleMerge = () => {
    if (selectedDrafts.length < 2) {
      toast({
        title: "Select Multiple Drafts",
        description: "Please select at least 2 drafts to merge",
        variant: "destructive",
      });
      return;
    }
    mergeMutation.mutate(selectedDrafts);
  };

  const handleSaveDraft = (draftId: number) => {
    saveDraftMutation.mutate(draftId);
  };

  if (!drafts || drafts.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Campaign Draft Variations
            </CardTitle>
            <CardDescription>
              Review {drafts.length} AI-generated variations and select your favorites to merge
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-1">
            {currentIndex + 1} / {drafts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Draft Selection */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Checkbox
              id={`draft-${currentDraft.id}`}
              checked={selectedDrafts.includes(currentDraft.id)}
              onCheckedChange={() => toggleSelection(currentDraft.id)}
              data-testid={`checkbox-draft-${currentIndex + 1}`}
            />
            <label htmlFor={`draft-${currentDraft.id}`} className="text-sm font-medium cursor-pointer">
              Select Variation {currentDraft.draftNumber}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveDraft(currentDraft.id)}
              disabled={saveDraftMutation.isPending || savedDrafts.includes(currentDraft.id)}
              data-testid={`button-save-draft-${currentIndex + 1}`}
            >
              {savedDrafts.includes(currentDraft.id) ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save to Campaigns
                </>
              )}
            </Button>
            <Badge variant={selectedDrafts.includes(currentDraft.id) ? "default" : "outline"}>
              {selectedDrafts.includes(currentDraft.id) ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Selected
                </>
              ) : (
                "Not Selected"
              )}
            </Badge>
          </div>
        </div>

        {/* Draft Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-draft-title">
              {currentDraft.title}
            </h3>
            <Badge variant="secondary" className="mb-3">
              {currentDraft.aiModel}
            </Badge>
          </div>

          {currentDraft.content?.subject && (
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Subject Line</p>
              <p className="text-base" data-testid="text-draft-subject">
                {currentDraft.content.subject}
              </p>
            </div>
          )}

          {currentDraft.content?.content && (
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Email Body</p>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap" style={{ lineHeight: '1.7' }} data-testid="text-draft-body">
                {currentDraft.content.content}
              </div>
            </div>
          )}

          {currentDraft.content?.cta && (
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Call-to-Action</p>
              <p className="font-medium text-primary" data-testid="text-draft-cta">
                {(() => {
                  // Parse [Button]...[/Button] format
                  const buttonMatch = currentDraft.content.cta.match(/\[Button\](.*?)\[\/Button\]/);
                  return buttonMatch ? buttonMatch[1] : currentDraft.content.cta;
                })()}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={drafts.length <= 1}
            data-testid="button-previous-draft"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            {drafts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
                data-testid={`indicator-draft-${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={drafts.length <= 1}
            data-testid="button-next-draft"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Merge Button */}
        <Button
          onClick={handleMerge}
          disabled={selectedDrafts.length < 2 || mergeMutation.isPending}
          className="w-full"
          size="lg"
          data-testid="button-merge-drafts"
        >
          {mergeMutation.isPending ? (
            <>
              <span className="mr-2">Merging...</span>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </>
          ) : selectedDrafts.length < 2 ? (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Select at least 2 drafts to merge
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Merge Selected Drafts ({selectedDrafts.length})
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
