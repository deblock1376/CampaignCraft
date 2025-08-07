import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-slate-900">{campaign.title}</p>
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
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.isArray(templates) ? templates.slice(0, 3).map((template: any) => (
                    <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${template.icon} text-blue-600 text-sm`}></i>
                        </div>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                      <div className="flex items-center text-xs text-slate-500">
                        <i className="fas fa-clock mr-1"></i>
                        <span>{template.setupTime}</span>
                      </div>
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
