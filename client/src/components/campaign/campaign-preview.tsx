import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface CampaignPreviewProps {
  campaign: any;
  isGenerating: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  form?: any;
  onSubmit?: (data: any) => void;
  generateMutation?: any;
  stylesheets?: any[];
  isConfigOpen?: boolean;
  setIsConfigOpen?: (open: boolean) => void;
  onRegenerate?: () => void;
  onSaveDraft?: () => void;
  onExport?: () => void;
}

export default function CampaignPreview({ 
  campaign, 
  isGenerating, 
  activeTab, 
  onTabChange, 
  form, 
  onSubmit, 
  generateMutation, 
  stylesheets, 
  isConfigOpen, 
  setIsConfigOpen,
  onRegenerate,
  onSaveDraft,
  onExport
}: CampaignPreviewProps) {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };
  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generate Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">Generating your campaign...</p>
                <p className="text-xs text-blue-700">This usually takes 10-30 seconds</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Generate Campaign</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isConfigOpen ? (
                    <i className="fas fa-chevron-up text-slate-600"></i>
                  ) : (
                    <i className="fas fa-chevron-down text-slate-600"></i>
                  )}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {form && onSubmit ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="brandStylesheetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grounding Library</FormLabel>
                          <p className="text-xs text-slate-500 mb-2">Apply your organization's brand voice and messaging guidelines</p>
                          <div className="flex space-x-2">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select guide" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(stylesheets) ? stylesheets.map((stylesheet: any) => (
                                  <SelectItem key={stylesheet.id} value={stylesheet.id.toString()}>
                                    {stylesheet.name}
                                  </SelectItem>
                                )) : null}
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="sm">
                              <i className="fas fa-cog"></i>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Objective</FormLabel>
                          <p className="text-xs text-slate-500 mb-2">What action do you want readers to take after seeing this campaign?</p>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select objective" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="donation">Increase Donations</SelectItem>
                              <SelectItem value="membership">Grow Members</SelectItem>
                              <SelectItem value="engagement">Engage Users</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Notes</FormLabel>
                          <p className="text-xs text-slate-500 mb-2">Provide context about the story or campaign background to guide AI generation</p>
                          <FormControl>
                            <Textarea
                              placeholder="Brief context about the news story or campaign trigger..."
                              className="resize-none min-h-[60px] max-h-[300px]"
                              rows={3}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Auto-expand the textarea
                                const textarea = e.target;
                                textarea.style.height = 'auto';
                                textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
                              }}
                              onInput={(e) => {
                                // Auto-expand on input as well
                                const textarea = e.target as HTMLTextAreaElement;
                                textarea.style.height = 'auto';
                                textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={generateMutation?.isPending}
                    >
                      {generateMutation?.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic mr-2"></i>
                          Generate Campaign
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-magic text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Generate</h3>
                  <p className="text-sm text-slate-600">Configure your campaign settings and click "Generate Campaign" to get started.</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Campaign</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <i className="fas fa-file-import mr-2"></i>
              Load Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content Preview</TabsTrigger>
            <TabsTrigger value="export">Export Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <div className="bg-slate-50 rounded-lg p-6">
              {campaign.content?.subject && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Subject: {campaign.content.subject}
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(campaign.content.subject, "Subject line")}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="prose max-w-none">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-slate-900">Email Content</h5>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(campaign.content?.content?.replace(/<[^>]*>/g, '') || '', "Email content")}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    <div className="whitespace-pre-wrap" style={{ lineHeight: '1.7' }}>
                      {typeof campaign.content?.content === 'string' 
                        ? campaign.content.content
                        : campaign.content?.content
                      }
                    </div>
                  </div>
                </div>
                
                {campaign.content?.cta && (
                  <div className="bg-white border-l-4 border-primary p-4 my-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-900">Call to Action</h5>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Extract button text from [Button]...[/Button] format
                          const buttonMatch = campaign.content.cta.match(/\[Button\](.*?)\[\/Button\]/);
                          const buttonText = buttonMatch ? buttonMatch[1] : campaign.content.cta;
                          copyToClipboard(buttonText, "Call to action");
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Button className="bg-primary text-white hover:bg-blue-700">
                      {(() => {
                        // Parse [Button]...[/Button] format
                        const buttonMatch = campaign.content.cta.match(/\[Button\](.*?)\[\/Button\]/);
                        return buttonMatch ? buttonMatch[1] : campaign.content.cta;
                      })()}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const fullCampaign = `Subject: ${campaign.content?.subject || ''}\n\n${campaign.content?.content?.replace(/<[^>]*>/g, '') || ''}\n\nCall to Action: ${campaign.content?.cta || ''}`;
                    copyToClipboard(fullCampaign, "Full campaign");
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm">
                  <i className="fas fa-edit mr-2"></i>
                  Edit Content
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRegenerate}
                  disabled={!onRegenerate}
                >
                  <i className="fas fa-redo mr-2"></i>
                  Regenerate
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSaveDraft}
                  disabled={!onSaveDraft}
                >
                  <i className="fas fa-save mr-2"></i>
                  Save Draft
                </Button>
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-emerald-600"
                  onClick={onExport}
                  disabled={!onExport}
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Campaign
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-file-alt mr-2"></i>
                    Export Formats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <i className="fab fa-google mr-2"></i>
                    Export as Google Doc
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <i className="fas fa-code mr-2"></i>
                    Export as Email HTML
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <i className="fas fa-file-alt mr-2"></i>
                    Export as txt
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
