import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Sparkles, Target, ArrowRight, FileText, Zap, Users } from "lucide-react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
  });

  const recentCampaigns = Array.isArray(campaigns) ? campaigns.slice(0, 3) : [];

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Campaign Dashboard" 
          subtitle="Choose your path: create new campaigns or improve existing ones"
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Two-Path System */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Path 1: Create Campaign */}
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg group" data-testid="card-path-create">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Create Campaign</CardTitle>
                  <CardDescription className="text-base">
                    Generate AI-powered marketing campaigns grounded in your news brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      <span>Generate 5+ draft variations instantly</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span>Ground campaigns in your news brand</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span>Tailor content for specific segments</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href="/campaigns/new">
                      <Button className="w-full group-hover:shadow-md transition-shadow" size="lg" data-testid="button-start-create">
                        Start Creating
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Path 2: Get Feedback */}
              <Card className="border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg group" data-testid="card-path-evaluate">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Get Feedback</CardTitle>
                  <CardDescription className="text-base">Evaluate existing campaigns against BlueLena best practices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <Target className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>Score against industry standards</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Sparkles className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>Get AI improvement suggestions</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Zap className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>One-click rewrites</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href="/campaigns/evaluate">
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 group-hover:shadow-md transition-shadow" 
                        size="lg"
                        data-testid="button-start-evaluate"
                      >
                        Evaluate Campaign
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            {recentCampaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Campaigns</CardTitle>
                    <Link href="/campaigns/history">
                      <Button variant="ghost" size="sm" data-testid="button-view-all">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCampaigns.map((campaign: any) => (
                      <Link key={campaign.id} href="/campaigns/history">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group" data-testid={`campaign-item-${campaign.id}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 group-hover:text-primary">{campaign.title}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(campaign.createdAt).toLocaleDateString()} • {campaign.type}
                            </p>
                          </div>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
