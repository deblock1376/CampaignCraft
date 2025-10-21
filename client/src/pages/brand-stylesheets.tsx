import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandStylesheetSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Upload, FileText, X } from "lucide-react";

const formSchema = insertBrandStylesheetSchema.extend({
  keyMessagesText: z.string().optional(),
  // Materials fields
  brandVoiceText: z.string().optional(),
  strategyPlaybookText: z.string().optional(),
  styleGuideText: z.string().optional(),
  aboutUsText: z.string().optional(),
  pastCampaignsText: z.string().optional(),
  impactStoriesText: z.string().optional(),
  testimonialsText: z.string().optional(),
  segmentsText: z.string().optional(),
  surveyResponsesText: z.string().optional(),
  localDatesText: z.string().optional(),
  surveyResearchText: z.string().optional(),
  campaignMetricsText: z.string().optional(),
}).omit({
  newsroomId: true,
});

export default function BrandStylesheets() {
  const [, setLocation] = useLocation();
  const [editingStylesheet, setEditingStylesheet] = useState<any>(null);
  const [deletingStylesheet, setDeletingStylesheet] = useState<any>(null);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const newsroomId = user.newsroomId || 1;
  
  // File upload state for each material field
  const [materialFiles, setMaterialFiles] = useState<Record<string, string>>({
    brandVoice: "",
    strategyPlaybook: "",
    styleGuide: "",
    aboutUs: "",
    pastCampaigns: "",
    impactStories: "",
    testimonials: "",
    segments: "",
    surveyResponses: "",
    localDates: "",
    surveyResearch: "",
    campaignMetrics: "",
  });

  const { data: stylesheets, isLoading } = useQuery({
    queryKey: ["/api/newsrooms", newsroomId, "stylesheets"],
    queryFn: async () => {
      const response = await fetch(`/api/newsrooms/${newsroomId}/stylesheets`);
      if (!response.ok) {
        throw new Error('Failed to fetch stylesheets');
      }
      return response.json();
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
        description: "Grounding guide updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grounding guide",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/stylesheets/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsrooms", newsroomId, "stylesheets"] });
      setDeletingStylesheet(null);
      toast({
        title: "Success",
        description: "Grounding library deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grounding library",
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
      // Materials fields
      brandVoiceText: "",
      strategyPlaybookText: "",
      styleGuideText: "",
      aboutUsText: "",
      pastCampaignsText: "",
      impactStoriesText: "",
      testimonialsText: "",
      segmentsText: "",
      surveyResponsesText: "",
      localDatesText: "",
      surveyResearchText: "",
      campaignMetricsText: "",
    },
  });

  const onSubmit = (data: any) => {
    const keyMessages = data.keyMessagesText
      ? data.keyMessagesText.split('\n').filter((msg: string) => msg.trim())
      : [];
    
    // Build materials structure from text fields and file uploads
    const materials = {
      brandFoundation: {
        brandVoice: (data.brandVoiceText || materialFiles.brandVoice) ? { 
          text: data.brandVoiceText,
          fileUrl: materialFiles.brandVoice || undefined,
        } : undefined,
        strategyPlaybook: (data.strategyPlaybookText || materialFiles.strategyPlaybook) ? { 
          text: data.strategyPlaybookText,
          fileUrl: materialFiles.strategyPlaybook || undefined,
        } : undefined,
        styleGuide: (data.styleGuideText || materialFiles.styleGuide) ? { 
          text: data.styleGuideText,
          fileUrl: materialFiles.styleGuide || undefined,
        } : undefined,
        aboutUs: (data.aboutUsText || materialFiles.aboutUs) ? { 
          text: data.aboutUsText,
          fileUrl: materialFiles.aboutUs || undefined,
        } : undefined,
      },
      campaignExamples: {
        pastCampaigns: (data.pastCampaignsText || materialFiles.pastCampaigns) ? { 
          text: data.pastCampaignsText,
          fileUrl: materialFiles.pastCampaigns || undefined,
        } : undefined,
        impactStories: (data.impactStoriesText || materialFiles.impactStories) ? { 
          text: data.impactStoriesText,
          fileUrl: materialFiles.impactStories || undefined,
        } : undefined,
        testimonials: (data.testimonialsText || materialFiles.testimonials) ? { 
          text: data.testimonialsText,
          fileUrl: materialFiles.testimonials || undefined,
        } : undefined,
      },
      audienceIntelligence: {
        segments: (data.segmentsText || materialFiles.segments) ? { 
          text: data.segmentsText,
          fileUrl: materialFiles.segments || undefined,
        } : undefined,
        surveyResponses: (data.surveyResponsesText || materialFiles.surveyResponses) ? { 
          text: data.surveyResponsesText,
          fileUrl: materialFiles.surveyResponses || undefined,
        } : undefined,
        localDates: (data.localDatesText || materialFiles.localDates) ? { 
          text: data.localDatesText,
          fileUrl: materialFiles.localDates || undefined,
        } : undefined,
      },
      performanceData: {
        surveyResearch: (data.surveyResearchText || materialFiles.surveyResearch) ? { 
          text: data.surveyResearchText,
          fileUrl: materialFiles.surveyResearch || undefined,
        } : undefined,
        campaignMetrics: (data.campaignMetricsText || materialFiles.campaignMetrics) ? { 
          text: data.campaignMetricsText,
          fileUrl: materialFiles.campaignMetrics || undefined,
        } : undefined,
      },
    };
    
    const submitData = {
      ...data,
      keyMessages,
      materials,
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
    
    // Remove text fields from submit data
    delete submitData.keyMessagesText;
    delete submitData.brandVoiceText;
    delete submitData.strategyPlaybookText;
    delete submitData.styleGuideText;
    delete submitData.aboutUsText;
    delete submitData.pastCampaignsText;
    delete submitData.impactStoriesText;
    delete submitData.testimonialsText;
    delete submitData.segmentsText;
    delete submitData.surveyResponsesText;
    delete submitData.localDatesText;
    delete submitData.surveyResearchText;
    delete submitData.campaignMetricsText;
    
    // Only handle update, create is done through Marketing Assistant
    if (editingStylesheet) {
      updateMutation.mutate({ id: editingStylesheet.id, data: submitData });
    }
  };

  const handleEdit = (stylesheet: any) => {
    setEditingStylesheet(stylesheet);
    
    // Extract materials text and file URLs from the materials object
    const materials = stylesheet.materials || {};
    const brandFoundation = materials.brandFoundation || {};
    const campaignExamples = materials.campaignExamples || {};
    const audienceIntelligence = materials.audienceIntelligence || {};
    const performanceData = materials.performanceData || {};
    
    // Load file URLs into state
    setMaterialFiles({
      brandVoice: brandFoundation.brandVoice?.fileUrl || "",
      strategyPlaybook: brandFoundation.strategyPlaybook?.fileUrl || "",
      styleGuide: brandFoundation.styleGuide?.fileUrl || "",
      aboutUs: brandFoundation.aboutUs?.fileUrl || "",
      pastCampaigns: campaignExamples.pastCampaigns?.fileUrl || "",
      impactStories: campaignExamples.impactStories?.fileUrl || "",
      testimonials: campaignExamples.testimonials?.fileUrl || "",
      segments: audienceIntelligence.segments?.fileUrl || "",
      surveyResponses: audienceIntelligence.surveyResponses?.fileUrl || "",
      localDates: audienceIntelligence.localDates?.fileUrl || "",
      surveyResearch: performanceData.surveyResearch?.fileUrl || "",
      campaignMetrics: performanceData.campaignMetrics?.fileUrl || "",
    });
    
    form.reset({
      name: stylesheet.name,
      description: stylesheet.description || "",
      tone: stylesheet.tone,
      voice: stylesheet.voice,
      keyMessagesText: stylesheet.keyMessages ? stylesheet.keyMessages.join('\n') : "",
      guidelines: stylesheet.guidelines || "",
      isDefault: stylesheet.isDefault,
      // Materials fields
      brandVoiceText: brandFoundation.brandVoice?.text || "",
      strategyPlaybookText: brandFoundation.strategyPlaybook?.text || "",
      styleGuideText: brandFoundation.styleGuide?.text || "",
      aboutUsText: brandFoundation.aboutUs?.text || "",
      pastCampaignsText: campaignExamples.pastCampaigns?.text || "",
      impactStoriesText: campaignExamples.impactStories?.text || "",
      testimonialsText: campaignExamples.testimonials?.text || "",
      segmentsText: audienceIntelligence.segments?.text || "",
      surveyResponsesText: audienceIntelligence.surveyResponses?.text || "",
      localDatesText: audienceIntelligence.localDates?.text || "",
      surveyResearchText: performanceData.surveyResearch?.text || "",
      campaignMetricsText: performanceData.campaignMetrics?.text || "",
    });
  };

  const handleCloseDialog = () => {
    setEditingStylesheet(null);
    form.reset();
    setMaterialFiles({
      brandVoice: "",
      strategyPlaybook: "",
      styleGuide: "",
      aboutUs: "",
      pastCampaigns: "",
      impactStories: "",
      testimonials: "",
      segments: "",
      surveyResponses: "",
      localDates: "",
      surveyResearch: "",
      campaignMetrics: "",
    });
  };

  // Helper function to handle file uploads
  const handleFileUpload = (fieldName: string, uploadURL: string) => {
    setMaterialFiles(prev => ({ ...prev, [fieldName]: uploadURL }));
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Grounding Library" 
          subtitle="Manage your newsroom's brand voice and messaging guidelines"
          action={
            <Button onClick={() => setLocation("/assistant?goal=brand-setup")} className="flex items-center justify-center">
              <i className="fas fa-plus mr-2"></i>
              Build New Library
            </Button>
          }
        />
        
        <Dialog open={!!editingStylesheet} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Grounding Library</DialogTitle>
              <DialogDescription>
                Update the materials and guidelines that shape your AI-generated campaigns
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="brand">Brand Foundation</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaign Examples</TabsTrigger>
                    <TabsTrigger value="audience">Audience Intel</TabsTrigger>
                    <TabsTrigger value="performance">Performance Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
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
                  </TabsContent>
                  
                  <TabsContent value="brand" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Foundational materials that define your brand's identity and voice
                    </p>
                    <FormField
                      control={form.control}
                      name="brandVoiceText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Voice & Mission</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your brand's voice, mission, and core values..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.brandVoice && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.brandVoice.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, brandVoice: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("brandVoice", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="strategyPlaybookText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strategy Playbook</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your strategic approach, editorial philosophy, and content strategy..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.strategyPlaybook && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.strategyPlaybook.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, strategyPlaybook: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("strategyPlaybook", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="styleGuideText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand/Style Guide</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Stylistic guidelines, formatting rules, and brand standards..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.styleGuide && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.styleGuide.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, styleGuide: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("styleGuide", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aboutUsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Us Statement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your newsroom's story, history, and what makes you unique..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.aboutUs && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.aboutUs.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, aboutUs: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("aboutUs", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="campaigns" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Examples of successful campaigns and impactful stories that demonstrate your approach
                    </p>
                    <FormField
                      control={form.control}
                      name="pastCampaignsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Past Campaigns</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Examples of successful past marketing campaigns and their strategies..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.pastCampaigns && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.pastCampaigns.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, pastCampaigns: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("pastCampaigns", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="impactStoriesText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impact News Stories</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Stories that had significant community impact or exemplify your journalism..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.impactStories && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.impactStories.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, impactStories: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("impactStories", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="testimonialsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reader Testimonials</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Feedback from readers, subscriber testimonials, and community responses..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.testimonials && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.testimonials.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, testimonials: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("testimonials", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="audience" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Information about your audience and community that helps tailor campaigns
                    </p>
                    <FormField
                      control={form.control}
                      name="segmentsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audience Segments</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your key audience segments, demographics, and reader personas..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.segments && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.segments.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, segments: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("segments", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="surveyResponsesText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audience Survey Responses</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Insights from reader surveys, feedback forms, and audience research..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.surveyResponses && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.surveyResponses.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, surveyResponses: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("surveyResponses", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="localDatesText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Local Dates</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Important local events, community dates, and regional milestones..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.localDates && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.localDates.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, localDates: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("localDates", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Data and metrics that inform campaign effectiveness and strategy
                    </p>
                    <FormField
                      control={form.control}
                      name="surveyResearchText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Survey & Research Data</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Market research findings, survey data, and analytical insights..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.surveyResearch && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.surveyResearch.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, surveyResearch: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("surveyResearch", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="campaignMetricsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performance Metrics & Analytics</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Campaign performance data, engagement metrics, and KPIs..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          {materialFiles.campaignMetrics && (
                            <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1 mt-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="truncate flex-1">{materialFiles.campaignMetrics.split('/').pop()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-slate-200"
                                onClick={() => setMaterialFiles(prev => ({ ...prev, campaignMetrics: "" }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={async () => {
                              const response = await apiRequest("POST", "/api/objects/upload");
                              const data = await response.json();
                              return { method: "PUT" as const, url: data.uploadURL };
                            }}
                            onComplete={(result) => {
                              if (result.successful && result.successful.length > 0) {
                                const file = result.successful[0];
                                if (file.uploadURL) {
                                  handleFileUpload("campaignMetrics", file.uploadURL);
                                }
                              }
                            }}
                            buttonClassName="h-7 px-3 text-xs mt-1"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload File
                          </ObjectUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Grounding Library"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
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
                        
                        {/* Documents Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-700">Documents</p>
                            <ObjectUploader
                              maxNumberOfFiles={5}
                              maxFileSize={10485760}
                              onGetUploadParameters={async () => {
                                const response = await apiRequest("POST", "/api/objects/upload");
                                const data = await response.json();
                                return {
                                  method: "PUT" as const,
                                  url: data.uploadURL
                                };
                              }}
                              onComplete={async (result) => {
                                if (result.successful && result.successful.length > 0) {
                                  const uploadedFile = result.successful[0];
                                  const filename = uploadedFile.name;
                                  const documentURL = uploadedFile.uploadURL;
                                  
                                  try {
                                    await apiRequest("PUT", `/api/grounding-guides/${stylesheet.id}/documents`, {
                                      documentURL,
                                      filename
                                    });
                                    
                                    queryClient.invalidateQueries({ 
                                      queryKey: ["/api/newsrooms", newsroomId, "stylesheets"] 
                                    });
                                    
                                    toast({
                                      title: "Document uploaded",
                                      description: `${filename} added to grounding guide`
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Upload failed",
                                      description: "Failed to add document to grounding guide",
                                      variant: "destructive"
                                    });
                                  }
                                }
                              }}
                              buttonClassName="h-6 px-2 text-xs"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Add
                            </ObjectUploader>
                          </div>
                          
                          {stylesheet.documentPaths && stylesheet.documentPaths.length > 0 ? (
                            <div className="space-y-1">
                              {stylesheet.documentPaths.slice(0, 3).map((docPath: string, index: number) => {
                                const [filename] = docPath.split(':');
                                return (
                                  <div key={index} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1">
                                    <div className="flex items-center">
                                      <FileText className="w-3 h-3 mr-1 text-slate-400" />
                                      <span className="truncate max-w-32">{filename}</span>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-4 w-4 p-0 hover:bg-slate-200"
                                      onClick={async () => {
                                        try {
                                          await apiRequest("DELETE", `/api/grounding-guides/${stylesheet.id}/documents`, {
                                            documentPath: docPath.split(':')[1]
                                          });
                                          
                                          queryClient.invalidateQueries({ 
                                            queryKey: ["/api/newsrooms", newsroomId, "stylesheets"] 
                                          });
                                          
                                          toast({
                                            title: "Document removed",
                                            description: `${filename} removed from grounding guide`
                                          });
                                        } catch (error) {
                                          toast({
                                            title: "Remove failed",
                                            description: "Failed to remove document",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                              {stylesheet.documentPaths.length > 3 && (
                                <p className="text-xs text-slate-400">+{stylesheet.documentPaths.length - 3} more documents</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">No documents uploaded</p>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(stylesheet)}>
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeletingStylesheet(stylesheet)}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
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
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Grounding Libraries Yet</h3>
                <p className="text-sm text-slate-600 mb-4">Build your first grounding library using the Marketing Assistant's guided workflow</p>
                <Button onClick={() => setLocation("/assistant")}>
                  <i className="fas fa-wand-magic-sparkles mr-2"></i>
                  Go to Marketing Assistant
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStylesheet} onOpenChange={(isOpen) => !isOpen && setDeletingStylesheet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grounding Library?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingStylesheet?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingStylesheet.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
