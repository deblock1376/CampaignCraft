import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface Conversation {
  id: number;
  newsroomId: number;
  userId: number;
  campaignPlanId?: number;
  title?: string;
  context?: {
    objective?: string;
    guideId?: number;
    segments?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function SavedCampaigns() {
  const { user } = useAuth();
  const newsroomId = user?.newsroomId;

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/newsrooms', newsroomId, 'conversations'],
    enabled: !!newsroomId,
  });

  const { data: campaignPlans } = useQuery({
    queryKey: ['/api/campaign-plans', newsroomId],
    enabled: !!newsroomId,
  });

  const getCampaignPlanName = (planId?: number) => {
    if (!planId || !campaignPlans) return null;
    const plan = (campaignPlans as any[]).find((p: any) => p.id === planId);
    return plan?.title;
  };

  const sortedConversations = conversations 
    ? [...conversations].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved Campaigns</h1>
        <p className="text-muted-foreground mt-2">
          Resume your campaign building conversations from where you left off
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sortedConversations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Saved Campaigns Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a conversation in the Campaign Builder to create your first saved campaign
              </p>
              <Link href="/campaign-builder">
                <Button>
                  Go to Campaign Builder
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedConversations.map((conversation) => {
            const planName = getCampaignPlanName(conversation.campaignPlanId);
            
            return (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {conversation.title || `Campaign Conversation ${conversation.id}`}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        {conversation.context?.objective && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Objective:</span>
                            <span className="capitalize">{conversation.context.objective}</span>
                          </div>
                        )}
                        {planName && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Campaign Plan:</span>
                            <span>{planName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Created {format(new Date(conversation.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          {conversation.updatedAt !== conversation.createdAt && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>Updated {format(new Date(conversation.updatedAt), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Link href={`/campaign-builder?conversationId=${conversation.id}`}>
                      <Button>
                        Resume
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Separator className="my-8" />

      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">About Saved Campaigns</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>Every conversation in the Campaign Builder is automatically saved</li>
          <li>You can bookmark conversation URLs to return to them later</li>
          <li>Your campaign settings and full chat history are preserved</li>
          <li>Click "Resume" to pick up right where you left off</li>
        </ul>
      </div>
    </div>
  );
}
