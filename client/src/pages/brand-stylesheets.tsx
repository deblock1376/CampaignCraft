import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandStylesheetSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertBrandStylesheetSchema.extend({
  keyMessagesText: z.string().optional(),
}).omit({
  newsroomId: true,
});

export default function BrandStylesheets() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStylesheet, setEditingStylesheet] = useState<any>(null);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;

  const { data: stylesheets, isLoading } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "stylesheets"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/newsrooms/${newsroomId}/stylesheets`, data);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "stylesheets"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Brand stylesheet created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create brand stylesheet",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/stylesheets/${id}`, data);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "stylesheets"] });
      setEditingStylesheet(null);
      form.reset();
      toast({
        title: "Success",
        description: "Brand stylesheet updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update brand stylesheet",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      tone: "",
      voice: "",
      keyMessagesText: "",
      guidelines: "",
      isDefault: false,
    },
  });

  const onSubmit = (data: any) => {
    const keyMessages = data.keyMessagesText
      ? data.keyMessagesText.split('\n').filter((msg: string) => msg.trim())
      : [];
    
    const submitData = {
      ...data,
      keyMessages,
      newsroomId: 1,
      colorPalette: {
        primary: "#2563EB",
        secondary: "#64748B",
        accent: "#10B981"
      },
      typography: {
        headlines: "Inter",
        body: "Inter"
      },
    };
    
    delete submitData.keyMessagesText;
    
    if (editingStylesheet) {
      updateMutation.mutate({ id: editingStylesheet.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (stylesheet: any) => {
    setEditingStylesheet(stylesheet);
    form.reset({
      name: stylesheet.name,
      description: stylesheet.description || "",
      tone: stylesheet.tone,
      voice: stylesheet.voice,
      keyMessagesText: stylesheet.keyMessages ? stylesheet.keyMessages.join('\n') : "",
      guidelines: stylesheet.guidelines || "",
      isDefault: stylesheet.isDefault,
    });
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    setEditingStylesheet(null);
    form.reset();
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Brand Stylesheets" 
          subtitle="Manage your newsroom's brand voice and messaging guidelines"
          action={
            <Dialog open={isCreateOpen || !!editingStylesheet} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button>
                  <i className="fas fa-plus mr-2"></i>
                  New Stylesheet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingStylesheet ? "Edit Brand Stylesheet" : "Create Brand Stylesheet"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Metro Daily - Default Style" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of this stylesheet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tone</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Professional yet approachable" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="voice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Voice</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Informative, trustworthy" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="keyMessagesText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Messages (one per line)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Independent local journalism matters&#10;Community-driven news coverage&#10;Transparency in reporting"
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="guidelines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Writing Guidelines</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Additional writing guidelines and instructions..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Default Stylesheet</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Use this as the default stylesheet for new campaigns
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingStylesheet ? (
                          updateMutation.isPending ? "Updating..." : "Update Stylesheet"
                        ) : (
                          createMutation.isPending ? "Creating..." : "Create Stylesheet"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />
        
        <div className="flex-1 overflow-y-auto p-8 max-h-screen">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-300 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-300 rounded"></div>
                        <div className="h-3 bg-slate-300 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stylesheets && Array.isArray(stylesheets) && stylesheets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stylesheets.map((stylesheet: any) => (
                  <Card key={stylesheet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{stylesheet.name}</CardTitle>
                        {stylesheet.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      {stylesheet.description && (
                        <p className="text-sm text-slate-600">{stylesheet.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Tone</p>
                          <p className="text-sm text-slate-600">{stylesheet.tone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Voice</p>
                          <p className="text-sm text-slate-600">{stylesheet.voice}</p>
                        </div>
                        {stylesheet.keyMessages && stylesheet.keyMessages.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">Key Messages</p>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                              {stylesheet.keyMessages.slice(0, 2).map((message: string, index: number) => (
                                <li key={index}>{message}</li>
                              ))}
                              {stylesheet.keyMessages.length > 2 && (
                                <li className="text-slate-400">+{stylesheet.keyMessages.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(stylesheet)}>
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-copy mr-1"></i>
                            Duplicate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-palette text-4xl text-slate-300 mb-4"></i>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No brand stylesheets</h3>
                <p className="text-sm text-slate-600 mb-4">Create your first brand stylesheet to get started</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <i className="fas fa-plus mr-2"></i>
                  Create Stylesheet
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
