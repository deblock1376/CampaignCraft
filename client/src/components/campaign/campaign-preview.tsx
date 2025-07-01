import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface CampaignPreviewProps {
  campaign: any;
  isGenerating: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function CampaignPreview({ campaign, isGenerating, activeTab, onTabChange }: CampaignPreviewProps) {
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
        <CardHeader>
          <CardTitle>Generate Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <i className="fas fa-magic text-4xl text-slate-300 mb-4"></i>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Generate</h3>
            <p className="text-sm text-slate-600">Configure your campaign settings and click "Generate Campaign" to get started.</p>
          </div>
        </CardContent>
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
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span><i className="fas fa-eye mr-1"></i>Est. Open Rate: {campaign.metrics?.estimatedOpenRate}%</span>
                    <span><i className="fas fa-mouse-pointer mr-1"></i>Est. Click Rate: {campaign.metrics?.estimatedClickRate}%</span>
                    <span><i className="fas fa-users mr-1"></i>Target: 15,247 subscribers</span>
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
                  <div 
                    className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: campaign.content?.content || '' }}
                  />
                </div>
                
                {campaign.content?.cta && (
                  <div className="bg-white border-l-4 border-primary p-4 my-6">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-900">Call to Action</h5>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(campaign.content.cta, "Call to action")}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Button className="bg-primary text-white hover:bg-blue-700">
                      {campaign.content.cta}
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
                <Button variant="outline" size="sm">
                  <i className="fas fa-redo mr-2"></i>
                  Regenerate
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <i className="fas fa-save mr-2"></i>
                  Save Draft
                </Button>
                <Button size="sm" className="bg-accent hover:bg-emerald-600">
                  <i className="fas fa-download mr-2"></i>
                  Export Campaign
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-file-alt mr-2"></i>
                      Export Formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-file-pdf mr-2"></i>
                      Export as PDF
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-file-word mr-2"></i>
                      Export as Word Doc
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-code mr-2"></i>
                      Export as HTML
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-file-csv mr-2"></i>
                      Export as CSV
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-share mr-2"></i>
                      Platform Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-envelope mr-2"></i>
                      Send to Email Platform
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fab fa-wordpress mr-2"></i>
                      Publish to WordPress
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fab fa-mailchimp mr-2"></i>
                      Send to Mailchimp
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-link mr-2"></i>
                      Copy Shareable Link
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
