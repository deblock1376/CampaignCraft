import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignHistory() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/newsrooms/1/campaigns"],
  });

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Campaign History" 
          subtitle="View and manage all your marketing campaigns"
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign: any) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{campaign.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{campaign.type}</span>
                            <span>•</span>
                            <span className="capitalize">{campaign.objective}</span>
                            <span>•</span>
                            <span>{campaign.aiModel}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={
                            campaign.status === 'active' ? 'default' :
                            campaign.status === 'completed' ? 'secondary' :
                            campaign.status === 'draft' ? 'outline' : 'secondary'
                          }>
                            {campaign.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-history text-4xl text-slate-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
                    <p className="text-sm text-slate-600">Your campaign history will appear here once you create your first campaign.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
