import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Calendar, Target, Zap, TrendingUp } from "lucide-react";

export default function CampaignHistory() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/campaigns`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });

  const campaignList = Array.isArray(campaigns) ? campaigns : [];

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
                ) : campaignList.length > 0 ? (
                  <div className="space-y-4">
                    {campaignList.map((campaign: any) => (
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{campaign.title}</DialogTitle>
                              </DialogHeader>
                              
                              <Tabs defaultValue="content" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="content">Content</TabsTrigger>
                                  <TabsTrigger value="metrics">Performance</TabsTrigger>
                                  <TabsTrigger value="details">Details</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="content" className="space-y-4">
                                  <div className="space-y-4">
                                    {campaign.content?.subject && (
                                      <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Subject Line</h4>
                                        <p className="p-3 bg-gray-50 rounded-lg">{campaign.content.subject}</p>
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Content</h4>
                                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                                        {campaign.content?.content}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Call to Action</h4>
                                      <p className="p-3 bg-emerald-50 rounded-lg font-medium text-emerald-800">
                                        {campaign.content?.cta}
                                      </p>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="metrics" className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <TrendingUp className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                                        <p className="text-2xl font-bold">{campaign.metrics?.estimatedOpenRate || campaign.content?.metrics?.estimatedOpenRate}%</p>
                                        <p className="text-sm text-gray-600">Est. Open Rate</p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <Target className="w-8 h-8 mx-auto text-green-500 mb-2" />
                                        <p className="text-2xl font-bold">{campaign.metrics?.estimatedClickRate || campaign.content?.metrics?.estimatedClickRate}%</p>
                                        <p className="text-sm text-gray-600">Est. Click Rate</p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <Zap className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                                        <p className="text-2xl font-bold">{campaign.metrics?.estimatedConversion || campaign.content?.metrics?.estimatedConversion}%</p>
                                        <p className="text-sm text-gray-600">Est. Conversion</p>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  
                                  {campaign.content?.insights && (
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-3">AI Insights</h4>
                                      <ul className="space-y-2">
                                        {campaign.content.insights.map((insight: string, index: number) => (
                                          <li key={index} className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span className="text-sm">{insight}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="details" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Campaign Type</h4>
                                      <p className="capitalize">{campaign.type}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Objective</h4>
                                      <p className="capitalize">{campaign.objective}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">AI Model</h4>
                                      <p>{campaign.aiModel}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Status</h4>
                                      <Badge variant={
                                        campaign.status === 'active' ? 'default' :
                                        campaign.status === 'completed' ? 'secondary' :
                                        campaign.status === 'draft' ? 'outline' : 'secondary'
                                      }>
                                        {campaign.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Created</h4>
                                      <p>{new Date(campaign.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-gray-700 mb-2">Last Updated</h4>
                                      <p>{new Date(campaign.updatedAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Context</h4>
                                    <p className="p-3 bg-gray-50 rounded-lg text-sm">{campaign.context}</p>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
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
