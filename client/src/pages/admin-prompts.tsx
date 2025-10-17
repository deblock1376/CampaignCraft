import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Edit, Save, X, History, Code } from "lucide-react";

interface Prompt {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  promptKey: string;
  promptText: string;
  systemMessage: string | null;
  variables: string[] | null;
  aiModel: string;
  status: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptCategory {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function AdminPrompts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<PromptCategory[]>({
    queryKey: ["/api/prompt-categories"],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/prompt-categories');
      return await res.json();
    },
  });

  const { data: prompts = [], isLoading: promptsLoading, error: promptsError } = useQuery<Prompt[]>({
    queryKey: ["/api/prompts"],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/prompts');
      return await res.json();
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Prompt> }) => {
      const res = await apiRequest('PUT', `/api/prompts/${data.id}`, data.updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      setEditingPrompt(null);
      toast({
        title: "Prompt Updated",
        description: "Your changes have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = 
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.promptKey.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || prompt.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSavePrompt = () => {
    if (!editingPrompt) return;
    
    updatePromptMutation.mutate({
      id: editingPrompt.id,
      updates: {
        name: editingPrompt.name,
        description: editingPrompt.description,
        promptText: editingPrompt.promptText,
        systemMessage: editingPrompt.systemMessage,
        aiModel: editingPrompt.aiModel,
        status: editingPrompt.status,
      },
    });
  };

  // Ensure categories is always an array before mapping
  const groupedPrompts = Array.isArray(categories) ? categories.map((category) => ({
    ...category,
    prompts: filteredPrompts.filter((p) => p.categoryId === category.id),
  })) : [];

  // Show error state if authentication fails
  if (categoriesError || promptsError) {
    return (
      <div className="h-full p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Error</CardTitle>
              <CardDescription>
                Your session has expired. Please log out and log back in to access the Prompt Manager.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Error: {(categoriesError as Error)?.message || (promptsError as Error)?.message || 'Unable to load prompts'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLoading = categoriesLoading || promptsLoading;

  return (
    <div className="h-full p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Prompt Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage and update all AI prompts used across the application
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Library</CardTitle>
            <CardDescription>
              {prompts.length} prompts across {categories.length} categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedCategory?.toString() || "all"}
                onValueChange={(value) => setSelectedCategory(value === "all" ? null : parseInt(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompts by Category */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading prompts...</div>
            ) : (
              <div className="space-y-6">
                {groupedPrompts.map((category) => (
                  category.prompts.length > 0 && (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <Badge variant="secondary">{category.prompts.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {category.prompts.map((prompt) => (
                          <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{prompt.name}</h4>
                                    <Badge variant={prompt.status === 'active' ? 'default' : 'secondary'}>
                                      {prompt.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {prompt.aiModel}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      v{prompt.version}
                                    </Badge>
                                  </div>
                                  {prompt.description && (
                                    <p className="text-sm text-muted-foreground">{prompt.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Code className="h-3 w-3" />
                                    <code className="bg-slate-100 px-2 py-1 rounded">{prompt.promptKey}</code>
                                    {prompt.variables && prompt.variables.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{prompt.variables.length} variable{prompt.variables.length > 1 ? 's' : ''}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingPrompt(prompt)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                {filteredPrompts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No prompts found matching your search
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt: {editingPrompt?.name}</DialogTitle>
            <DialogDescription>
              Update prompt text, system message, and configuration
            </DialogDescription>
          </DialogHeader>
          
          {editingPrompt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Prompt Name</Label>
                  <Input
                    id="name"
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select
                    value={editingPrompt.aiModel}
                    onValueChange={(value) => setEditingPrompt({ ...editingPrompt, aiModel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-5">GPT-5</SelectItem>
                      <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                      <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingPrompt.description || ""}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                />
              </div>

              {editingPrompt.systemMessage !== null && (
                <div className="space-y-2">
                  <Label htmlFor="systemMessage">System Message</Label>
                  <Textarea
                    id="systemMessage"
                    value={editingPrompt.systemMessage || ""}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, systemMessage: e.target.value })}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="promptText">Prompt Text</Label>
                <Textarea
                  id="promptText"
                  value={editingPrompt.promptText}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, promptText: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
                {editingPrompt.variables && editingPrompt.variables.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Variables: {editingPrompt.variables.map(v => `{{${v}}}`).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSavePrompt} disabled={updatePromptMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {updatePromptMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
