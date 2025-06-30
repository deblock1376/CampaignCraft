import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Users, Building, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
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

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    newsroomName: "",
    newsroomSlug: "",
    description: "",
    website: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });

  const { data: newsrooms, isLoading, refetch } = useQuery<Newsroom[]>({
    queryKey: ['/api/admin/newsrooms'],
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

  if (isLoading) {
    return (
      <div className="p-6">
        <Header title="Admin Control Panel" subtitle="Manage newsroom accounts and access" />
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
          <div className="flex items-center space-x-3">
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
            
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Administrator</span>
            </div>
          </div>
        }
      />

      <div className="mt-6 grid gap-6">
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
    </div>
  );
}