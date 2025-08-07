import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import QuickStartTemplates from "@/components/quickstart/quick-start-templates";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  const isAdmin = user.email === 'admin@campaigncraft.com';

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle="Overview of your newsroom's marketing campaigns"
          action={
            <Link href="/campaigns/new">
              <Button>
                <i className="fas fa-bolt mr-2"></i>
                Quick Generate
              </Button>
            </Link>
          }
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            


            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Campaigns
                  <Link href="/campaigns/history">
                    <Button variant="ghost" size="sm">
                      View All <i className="fas fa-arrow-right ml-1"></i>
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-300 rounded w-32"></div>
                          <div className="h-3 bg-slate-300 rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-slate-300 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(campaigns) && campaigns.length > 0 ? (
                  <div className="space-y-3">
                    {campaigns.slice(0, 5).map((campaign: any) => (
                      <Link key={campaign.id} href="/campaigns/history">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-slate-900 group-hover:text-primary">{campaign.title}</p>
                              {campaign.newsroomName && (
                                <Badge variant="outline" className="text-xs">
                                  {campaign.newsroomName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {new Date(campaign.createdAt).toLocaleDateString()} • {campaign.type}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                            <i className="fas fa-external-link-alt text-xs text-slate-400 group-hover:text-primary transition-colors"></i>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-inbox text-4xl text-slate-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns yet</h3>
                    <p className="text-sm text-slate-600 mb-4">Get started by creating your first campaign</p>
                    <Link href="/campaigns/new">
                      <Button>
                        <i className="fas fa-plus mr-2"></i>
                        Create Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Start Templates */}
            <QuickStartTemplates />
          </div>
        </div>
      </main>
    </>
  );
}
