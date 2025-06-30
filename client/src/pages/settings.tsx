import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Settings" 
          subtitle="Configure your account and application preferences"
        />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Newsroom Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Newsroom Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsroom-name">Newsroom Name</Label>
                    <Input id="newsroom-name" defaultValue="Metro Daily News" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://metrodaily.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" defaultValue="Local news and investigative journalism" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            {/* AI Model Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>AI Model Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Default AI Model</Label>
                      <p className="text-sm text-slate-600">Choose your preferred AI model for campaign generation</p>
                    </div>
                    <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="claude-sonnet-4">Anthropic Claude Sonnet 4</option>
                      <option value="gemini-pro">Google Gemini Pro</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">API Configuration</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="openai-key">OpenAI API Key</Label>
                        <Input 
                          id="openai-key" 
                          type="password" 
                          placeholder="sk-..." 
                          defaultValue="••••••••••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                        <Input 
                          id="anthropic-key" 
                          type="password" 
                          placeholder="sk-ant-..." 
                          defaultValue="••••••••••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="google-key">Google API Key</Label>
                        <Input 
                          id="google-key" 
                          type="password" 
                          placeholder="AIza..." 
                          defaultValue="••••••••••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Button>Update API Keys</Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Campaign Completion</Label>
                      <p className="text-sm text-slate-600">Get notified when AI campaign generation is complete</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Performance Alerts</Label>
                      <p className="text-sm text-slate-600">Receive alerts about campaign performance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Weekly Reports</Label>
                      <p className="text-sm text-slate-600">Get weekly summaries of your campaigns</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export & Data */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Export Campaign Data</Label>
                    <p className="text-sm text-slate-600">Download all your campaign data as CSV</p>
                  </div>
                  <Button variant="outline">
                    <i className="fas fa-download mr-2"></i>
                    Export
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base text-destructive">Delete All Data</Label>
                    <p className="text-sm text-slate-600">Permanently delete all campaigns and settings</p>
                  </div>
                  <Button variant="destructive">
                    <i className="fas fa-trash mr-2"></i>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
