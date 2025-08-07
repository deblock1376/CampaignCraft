import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Calendar, Target, Zap, TrendingUp, Search, Filter, X } from "lucide-react";

export default function CampaignHistory() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [objectiveFilter, setObjectiveFilter] = useState("all");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "campaigns"],
    enabled: !!newsroomId,
  });

  console.log('Campaign History Debug:', {
    user,
    newsroomId,
    campaigns,
    isLoading,
    error: error?.message || error,
  });

  const campaignList = Array.isArray(campaigns) ? campaigns : [];

  // Filter campaigns based on search and filter criteria
  const filteredCampaigns = useMemo(() => {
    return campaignList.filter((campaign: any) => {
      // Search filter - search in title, context, and AI model
      const matchesSearch = searchQuery === "" || 
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.context && campaign.context.toLowerCase().includes(searchQuery.toLowerCase())) ||
        campaign.aiModel.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || campaign.type === typeFilter;

      // Objective filter
      const matchesObjective = objectiveFilter === "all" || campaign.objective === objectiveFilter;

      return matchesSearch && matchesStatus && matchesType && matchesObjective;
    });
  }, [campaignList, searchQuery, statusFilter, typeFilter, objectiveFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setObjectiveFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || typeFilter !== "all" || objectiveFilter !== "all";

  if (error) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Header 
            title="Campaign History" 
            subtitle="View and manage all your marketing campaigns"
          />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error loading campaigns: {error instanceof Error ? error.message : String(error)}</p>
              <p className="text-sm text-red-600 mt-1">User ID: {user.id}, Newsroom ID: {newsroomId}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Campaigns</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredCampaigns.length} of {campaignList.length} campaigns
                      {hasActiveFilters && " (filtered)"}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search campaigns by title, context, or AI model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Objectives</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto pr-2">
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
                  ) : filteredCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {filteredCampaigns.map((campaign: any) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-slate-900">{campaign.title}</h3>
                            {campaign.newsroomName && (
                              <Badge variant="outline" className="text-xs">
                                {campaign.newsroomName}
                              </Badge>
                            )}
                          </div>
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
                                      <div className="p-4 bg-gray-50 rounded-lg text-sm max-h-60 overflow-y-auto">
                                        <div className="whitespace-pre-line leading-relaxed">
                                          {campaign.content?.content?.split('. ').join('.\n\n').replace(/\n{3,}/g, '\n\n')}
                                        </div>
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
                      {campaignList.length === 0 ? (
                        <>
                          <i className="fas fa-history text-4xl text-slate-300 mb-4"></i>
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
                          <p className="text-sm text-slate-600">Your campaign history will appear here once you create your first campaign.</p>
                        </>
                      ) : (
                        <>
                          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns match your filters</h3>
                          <p className="text-sm text-slate-600 mb-4">
                            Try adjusting your search terms or clearing some filters to see more results.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={clearFilters}
                            className="flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Clear All Filters</span>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
