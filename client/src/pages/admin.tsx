import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Users, Building, Plus, Eye, Calendar, Target, Zap, Edit, Mail, User, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";

interface Newsroom {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  newsroomId: number;
  createdAt: string;
  password?: string; // Optional field for password updates
}

interface NewsroomWithUser extends Newsroom {
  user?: User;
}

interface Campaign {
  id: number;
  newsroomId: number;
  title: string;
  type: string;
  objective: string;
  context?: string;
  aiModel: string;
  brandStylesheetId?: number;
  status: string;
  content?: any;
  metrics?: any;
  createdAt: string;
  updatedAt: string;
  newsroomName: string;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Check admin access
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Only allow admin@campaigncraft.com access
  if (!currentUser.email || currentUser.email !== 'admin@campaigncraft.com') {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                This area is restricted to system administrators only.
              </p>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  const [newAccount, setNewAccount] = useState({
    newsroomName: "",
    newsroomSlug: "",
    description: "",
    website: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });

  const { data: newsrooms, isLoading, refetch } = useQuery<NewsroomWithUser[]>({
    queryKey: ['/api/admin/newsrooms'],
    staleTime: 0,
  });

  const { data: allCampaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/admin/campaigns'],
    staleTime: 0,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest('PATCH', `/api/admin/newsrooms/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsrooms'] });
      toast({
        title: "Success",
        description: "Newsroom status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update newsroom status",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, name, email, password }: { id: number; name: string; email: string; password?: string }) => {
      const payload: any = { name, email };
      if (password && password.trim()) {
        payload.password = password;
      }
      return await apiRequest('PATCH', `/api/admin/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsrooms'] });
      setIsEditUserDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User account updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user account",
        variant: "destructive",
      });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (accountData: typeof newAccount) => {
      console.log('Sending account data:', accountData);
      return await apiRequest('POST', '/api/admin/accounts', accountData);
    },
    onSuccess: () => {
      // Force manual refetch and clear cache
      refetch();
      setTimeout(() => refetch(), 500); // Also refetch after a delay
      setIsCreateDialogOpen(false);
      setNewAccount({
        newsroomName: "",
        newsroomSlug: "",
        description: "",
        website: "",
        adminName: "",
        adminEmail: "",
        password: "",
      });
      toast({
        title: "Success",
        description: "Newsroom account created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create newsroom account",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    createAccountMutation.mutate(newAccount);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      name: editingUser.name,
      email: editingUser.email,
      password: editingUser.password,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Header 
          title="Admin Control Panel" 
          subtitle="Manage newsroom accounts and access"
          action={
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          }
        />
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header 
        title="Admin Control Panel" 
        subtitle="Manage newsroom accounts and access"
        action={
          <div className="flex items-center space-x-4 shrink-0">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Newsroom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Newsroom Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsroomName">Newsroom Name</Label>
                    <Input
                      id="newsroomName"
                      value={newAccount.newsroomName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewAccount(prev => ({
                          ...prev,
                          newsroomName: name,
                          newsroomSlug: generateSlug(name)
                        }));
                      }}
                      placeholder="e.g., City Tribune"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newsroomSlug">URL Slug</Label>
                    <Input
                      id="newsroomSlug"
                      value={newAccount.newsroomSlug}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, newsroomSlug: e.target.value }))}
                      placeholder="city-tribune"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newAccount.description}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Local news and community coverage"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newAccount.website}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://citytribune.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Name</Label>
                    <Input
                      id="adminName"
                      value={newAccount.adminName}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, adminName: e.target.value }))}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newAccount.adminEmail}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, adminEmail: e.target.value }))}
                      placeholder="admin@citytribune.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Choose a strong password"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAccountMutation.isPending}
                    >
                      {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Administrator</span>
            </div>
          </div>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Newsroom Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>All Campaigns</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <div className="grid gap-6">
              {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Newsrooms</p>
                  <p className="text-2xl font-bold">{newsrooms?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Accounts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {newsrooms?.filter(n => n.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {newsrooms?.filter(n => !n.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsroom Management */}
        <Card>
          <CardHeader>
            <CardTitle>Newsroom Account Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newsrooms?.map((newsroom) => (
                <div
                  key={newsroom.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{newsroom.name}</h3>
                      <Badge variant={newsroom.isActive ? "default" : "secondary"}>
                        {newsroom.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {newsroom.description || "No description"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Slug: {newsroom.slug}</span>
                      {newsroom.website && (
                        <span>Website: {newsroom.website}</span>
                      )}
                      <span>Created: {new Date(newsroom.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* User Account Information */}
                    {newsroom.user && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border-l-3 border-blue-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Account Admin</span>
                            </div>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{newsroom.user.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3 text-gray-500" />
                                <span className="text-sm text-gray-700">{newsroom.user.email}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Account created: {new Date(newsroom.user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(newsroom.user!)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-100"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {newsroom.isActive ? "Active" : "Suspended"}
                      </span>
                      <Switch
                        checked={newsroom.isActive}
                        onCheckedChange={() => handleToggleStatus(newsroom.id, newsroom.isActive)}
                        disabled={toggleStatusMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="space-y-6">
            {/* Campaign Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Campaigns</p>
                      <p className="text-2xl font-bold">{Array.isArray(allCampaigns) ? allCampaigns.length : 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email Campaigns</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Array.isArray(allCampaigns) ? allCampaigns.filter(c => c.type === 'email').length : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-sm text-gray-600">Social Campaigns</p>
                      <p className="text-2xl font-bold text-pink-600">
                        {Array.isArray(allCampaigns) ? allCampaigns.filter(c => c.type === 'social').length : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Array.isArray(allCampaigns) ? allCampaigns.filter(c => {
                          const campaignDate = new Date(c.createdAt);
                          const now = new Date();
                          return campaignDate.getMonth() === now.getMonth() && 
                                 campaignDate.getFullYear() === now.getFullYear();
                        }).length : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Campaigns List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>All Campaigns - God View</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(allCampaigns) || allCampaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No campaigns created yet</p>
                    <p className="text-sm text-gray-400">Campaigns will appear here as newsrooms create them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allCampaigns.map((campaign: Campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="font-semibold text-lg">{campaign.title}</div>
                              <Badge variant="outline" className="text-xs">
                                {campaign.newsroomName}
                              </Badge>
                              <Badge 
                                variant={campaign.type === 'email' ? 'default' : 
                                        campaign.type === 'social' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {campaign.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {campaign.objective}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Context:</span> {campaign.context || 'No context provided'}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>AI Model: {campaign.aiModel}</span>
                              <span>Status: {campaign.status}</span>
                              <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={campaign.status === 'active' ? 'default' : 
                                      campaign.status === 'completed' ? 'secondary' : 'outline'}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Account & Password</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editUserName">Name</Label>
                <Input
                  id="editUserName"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editUserEmail">Email</Label>
                <Input
                  id="editUserEmail"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editUserPassword">New Password</Label>
                <Input
                  id="editUserPassword"
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  Leave blank to keep current password. Minimum 6 characters.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditUserDialogOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update Account"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}