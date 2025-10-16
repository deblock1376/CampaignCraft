import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Plus, Edit, Trash2, ArrowLeft, Building, Mail, User as UserIcon, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { format } from "date-fns";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  newsroomId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Newsroom {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    newsroomId: "" as string | null,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Check for super admin access (newsroomId === null and role === 'admin')
  if (!currentUser.email || currentUser.role !== 'admin' || currentUser.newsroomId !== null) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                This area is restricted to super administrators only.
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

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    staleTime: 0,
  });

  const { data: newsrooms } = useQuery<Newsroom[]>({
    queryKey: ['/api/admin/newsrooms'],
    staleTime: 0,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return await apiRequest('POST', '/api/admin/users', {
        ...userData,
        newsroomId: userData.newsroomId === "" ? null : Number(userData.newsroomId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
        newsroomId: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<User> }) => {
      return await apiRequest('PATCH', `/api/admin/users/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/users/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      updates: {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        newsroomId: editingUser.newsroomId,
      },
    });
  };

  const handleDeleteUser = (id: number, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const getNewsroomName = (newsroomId: number | null) => {
    if (newsroomId === null) return "Super Admin";
    const newsroom = newsrooms?.find(n => n.id === newsroomId);
    return newsroom?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="User Management" 
        subtitle="Manage all users and their access across newsrooms"
        action={
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Admin Control
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "admin" | "user") => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="newsroom">Newsroom</Label>
                    <Select
                      value={newUser.newsroomId === null ? "super" : String(newUser.newsroomId)}
                      onValueChange={(value) => setNewUser({ ...newUser, newsroomId: value === "super" ? null : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select newsroom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super">Super Admin (No Newsroom)</SelectItem>
                        {newsrooms?.filter(n => n.isActive).map((newsroom) => (
                          <SelectItem key={newsroom.id} value={String(newsroom.id)}>
                            {newsroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave as "Super Admin" to create a super administrator with access to all newsrooms
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Loading users...
              </CardContent>
            </Card>
          ) : users && users.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first user</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First User
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {users?.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-8">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <UserIcon className="w-3 h-3 mr-1" />
                                User
                              </>
                            )}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {getNewsroomName(user.newsroomId)}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={user.id === currentUser.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value: "admin" | "user") => setEditingUser({ ...editingUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-newsroom">Newsroom</Label>
                    <Select
                      value={editingUser.newsroomId === null ? "super" : String(editingUser.newsroomId)}
                      onValueChange={(value) => setEditingUser({ ...editingUser, newsroomId: value === "super" ? null : Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select newsroom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super">Super Admin (No Newsroom)</SelectItem>
                        {newsrooms?.filter(n => n.isActive).map((newsroom) => (
                          <SelectItem key={newsroom.id} value={String(newsroom.id)}>
                            {newsroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditUser} disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
