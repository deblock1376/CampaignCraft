import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Trash2, Edit } from "lucide-react";

export default function Segments() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any>(null);
  const [newSegment, setNewSegment] = useState({ name: "", description: "" });

  const { data: segments, isLoading } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "segments"],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/segments`);
      if (!response.ok) throw new Error('Failed to fetch segments');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/newsrooms/${newsroomId}/segments`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "segments"] });
      setIsCreateOpen(false);
      setNewSegment({ name: "", description: "" });
      toast({ title: "Segment Created", description: "Audience segment has been saved successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      const response = await apiRequest("PATCH", `/api/segments/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "segments"] });
      setEditingSegment(null);
      toast({ title: "Segment Updated", description: "Changes have been saved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/segments/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "segments"] });
      toast({ title: "Segment Deleted", description: "Audience segment has been removed" });
    },
  });

  const handleCreate = () => {
    if (!newSegment.name || !newSegment.description) {
      toast({ title: "Required Fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(newSegment);
  };

  const handleUpdate = () => {
    if (!editingSegment) return;
    updateMutation.mutate({
      id: editingSegment.id,
      data: { name: editingSegment.name, description: editingSegment.description },
    });
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Audience Segments" 
          subtitle="Manage and reuse your target audience segments"
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Create Button */}
            <div className="flex justify-between items-center">
              <p className="text-slate-600">
                Save audience segments to quickly rewrite campaigns for different groups
              </p>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-segment">
                    <Plus className="h-4 w-4 mr-2" />
                    New Segment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Audience Segment</DialogTitle>
                    <DialogDescription>
                      Define a target audience group for campaign customization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="name">Segment Name</Label>
                      <Input
                        id="name"
                        data-testid="input-segment-name"
                        placeholder="e.g., Young Professionals"
                        value={newSegment.name}
                        onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        data-testid="input-segment-description"
                        placeholder="e.g., Ages 25-35, urban dwellers, tech-savvy, value convenience"
                        value={newSegment.description}
                        onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleCreate} 
                      disabled={createMutation.isPending}
                      className="w-full"
                      data-testid="button-save-segment"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Segment"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Segments List */}
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-500">Loading segments...</p>
                </CardContent>
              </Card>
            ) : !segments || segments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600">No audience segments yet</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first segment to get started</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {segments.map((segment: any) => (
                  <Card key={segment.id} data-testid={`card-segment-${segment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center">
                            <Users className="h-5 w-5 mr-2 text-primary" />
                            {segment.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {segment.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={editingSegment?.id === segment.id} onOpenChange={(open) => !open && setEditingSegment(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSegment({ ...segment })}
                                data-testid={`button-edit-${segment.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Segment</DialogTitle>
                              </DialogHeader>
                              {editingSegment && (
                                <div className="space-y-4 pt-4">
                                  <div>
                                    <Label>Segment Name</Label>
                                    <Input
                                      value={editingSegment.name}
                                      onChange={(e) => setEditingSegment({ ...editingSegment, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={editingSegment.description}
                                      onChange={(e) => setEditingSegment({ ...editingSegment, description: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                  <Button 
                                    onClick={handleUpdate} 
                                    disabled={updateMutation.isPending}
                                    className="w-full"
                                  >
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(segment.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${segment.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
