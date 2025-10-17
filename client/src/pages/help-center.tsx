import { BookOpen, FileText, Target, Users, Sparkles, Upload, History, Settings, Shield } from "lucide-react";
import Sidebar from "../components/layout/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HelpCenter() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Help & Guides</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about creating effective AI-powered marketing campaigns
            </p>
          </div>

          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="getting-started" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">Getting Started</div>
                    <div className="text-sm text-muted-foreground">Quick introduction to CampaignCraft</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Welcome to CampaignCraft!</h3>
                  <p className="text-muted-foreground mb-4">
                    CampaignCraft is your AI-powered marketing assistant designed specifically for newsrooms. 
                    It helps you create compelling email campaigns, maintain brand consistency, and engage your audience effectively.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Quick Start Workflow</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Create a <strong>Grounding Library</strong> with your brand materials</li>
                    <li>Set up <strong>Audience Segments</strong> to target specific groups</li>
                    <li>Use the <strong>Campaign Builder</strong> to generate AI-powered campaigns</li>
                    <li>Evaluate campaigns using the <strong>BlueLena Framework</strong></li>
                    <li>Track your work in <strong>Campaign History</strong></li>
                  </ol>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Start by creating a Grounding Library first. This ensures your AI-generated 
                    campaigns stay on-brand and reflect your newsroom's unique voice.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="campaign-builder" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-semibold">Campaign Builder</div>
                    <div className="text-sm text-muted-foreground">AI-guided conversational campaign creation</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">What is Campaign Builder?</h3>
                  <p className="text-muted-foreground mb-4">
                    Campaign Builder is an AI-powered conversational interface that guides you through creating 
                    targeted marketing campaigns. Chat naturally with the AI assistant, and it will help you 
                    craft compelling email campaigns based on your goals.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How to Use Campaign Builder</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li><strong>Start the conversation:</strong> Click "Campaign Builder" in the sidebar</li>
                    <li><strong>Set your goals:</strong> Use the right panel to configure campaign objective and audience</li>
                    <li><strong>Chat with AI:</strong> Describe your campaign needs in natural language</li>
                    <li><strong>Upload files:</strong> Attach reference materials (PDFs, DOCX) to inform the AI</li>
                    <li><strong>Select AI model:</strong> Choose between GPT-5, Claude Sonnet 4, or Gemini 2.5 Flash</li>
                    <li><strong>Generate campaign:</strong> The AI creates multiple draft options for you</li>
                    <li><strong>Refine & iterate:</strong> Ask the AI to adjust tone, length, or messaging</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Campaign Builder Panel Options</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Objective:</strong> Choose from donation, engagement, event, newsletter, or custom goals</li>
                    <li><strong>Audience Segments:</strong> Select pre-defined audience groups for targeting</li>
                    <li><strong>Grounding Guides:</strong> Apply your brand libraries to maintain consistency</li>
                    <li><strong>Notes:</strong> Add specific context, story details, or talking points</li>
                    <li><strong>Reference Materials:</strong> Upload files to provide additional context</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> The AI reads and extracts content from uploaded files (PDFs, DOCX). 
                    Upload style guides, past campaigns, or story summaries to help the AI understand your needs better.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="grounding-library" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-semibold">Grounding Library</div>
                    <div className="text-sm text-muted-foreground">Brand materials and style guides</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">What is a Grounding Library?</h3>
                  <p className="text-muted-foreground mb-4">
                    A Grounding Library is a collection of your newsroom's brand materials, voice guidelines, 
                    past campaigns, and audience insights. It ensures all AI-generated campaigns stay on-brand 
                    and reflect your unique voice.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Creating a Grounding Library</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Navigate to <strong>Grounding Library</strong> in the sidebar</li>
                    <li>Click <strong>"Create New Guide"</strong></li>
                    <li>Fill in <strong>11 material types</strong> across 4 categories</li>
                    <li>Upload files or paste text for each material type</li>
                    <li>Save and apply to campaigns</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Material Categories</h4>
                  <div className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-2">Brand Foundation</Badge>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Brand Voice & Tone</li>
                        <li>• Strategy Playbook</li>
                        <li>• Style Guide</li>
                        <li>• About Us</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Campaign Examples</Badge>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Past Campaigns</li>
                        <li>• Impact Stories</li>
                        <li>• Testimonials</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Audience Intelligence</Badge>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Audience Segments</li>
                        <li>• Survey Responses</li>
                        <li>• Local Dates & Events</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Performance Data</Badge>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Survey Research</li>
                        <li>• Campaign Metrics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> You can now upload files (PDFs, DOCX, TXT) for ANY material field! 
                    The system will automatically extract text from uploaded documents and use it to inform AI generation.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="audience-segments" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-semibold">Audience Segments</div>
                    <div className="text-sm text-muted-foreground">Target specific groups effectively</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">What are Audience Segments?</h3>
                  <p className="text-muted-foreground mb-4">
                    Audience segments help you target specific groups with tailored messaging. Each segment 
                    has unique characteristics, interests, and motivations that the AI uses to personalize campaigns.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Creating Audience Segments</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to <strong>Audience Segments</strong> in the sidebar</li>
                    <li>Click <strong>"Create Segment"</strong></li>
                    <li>Define segment details:
                      <ul className="ml-6 mt-1 space-y-1">
                        <li>• Name (e.g., "Young Professionals")</li>
                        <li>• Description</li>
                        <li>• Characteristics (demographics, behaviors)</li>
                        <li>• Key interests</li>
                        <li>• Motivations & pain points</li>
                      </ul>
                    </li>
                    <li>Save and use in campaigns</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Using Segments in Campaigns</h4>
                  <p className="text-muted-foreground mb-2">
                    When creating a campaign in Campaign Builder, select one or more audience segments from 
                    the right panel. The AI will tailor messaging, tone, and CTAs to resonate with your selected audience.
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Create segments based on real reader data and personas. 
                    The more specific your segment details, the better the AI can personalize campaigns.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="campaign-evaluation" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <div className="font-semibold">Campaign Evaluation</div>
                    <div className="text-sm text-muted-foreground">BlueLena 5-pillar framework analysis</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">What is Campaign Evaluation?</h3>
                  <p className="text-muted-foreground mb-4">
                    Campaign Evaluation uses the BlueLena copywriting framework to analyze and improve your 
                    email campaigns. It provides detailed feedback across 5 professional copywriting pillars.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">The 5 Pillars</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <div>
                      <strong>1. Clarity:</strong> Is the message easy to understand? Does it avoid jargon?
                    </div>
                    <div>
                      <strong>2. Emotional Resonance:</strong> Does it connect emotionally with readers?
                    </div>
                    <div>
                      <strong>3. Audience Value Proposition:</strong> Does it clearly show benefits to the reader?
                    </div>
                    <div>
                      <strong>4. Urgency & Motivation:</strong> Does it inspire action without manipulation?
                    </div>
                    <div>
                      <strong>5. Trust & Credibility:</strong> Does it build confidence and authenticity?
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How to Use Evaluation</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Navigate to <strong>Campaign History</strong></li>
                    <li>Click <strong>"Evaluate this campaign"</strong> on any campaign</li>
                    <li>Review AI-generated scores and feedback for each pillar</li>
                    <li>Click <strong>"Rewrite"</strong> to generate an improved version</li>
                    <li>Compare original and rewritten versions</li>
                  </ol>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Use evaluation to learn what makes campaigns effective. 
                    Review the AI feedback to understand best practices and improve your future campaigns.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="file-uploads" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-cyan-500" />
                  <div className="text-left">
                    <div className="font-semibold">File Uploads & Text Extraction</div>
                    <div className="text-sm text-muted-foreground">Upload PDFs, DOCX to enrich AI context</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Where Can I Upload Files?</h3>
                  <p className="text-muted-foreground mb-4">
                    CampaignCraft supports file uploads in three key locations:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>1. Grounding Library:</strong> Upload brand materials for library creation (all 11 material fields)</li>
                    <li><strong>2. Campaign Builder Notes:</strong> Upload reference documents for specific campaign context</li>
                    <li><strong>3. Chat Assistant:</strong> Attach files directly to chat messages</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Supported File Types</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>PDF</strong> - Portable Document Format</li>
                    <li>• <strong>DOCX</strong> - Microsoft Word documents</li>
                    <li>• <strong>TXT</strong> - Plain text files</li>
                    <li>• Maximum file size: <strong>10MB per file</strong></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How Text Extraction Works</h4>
                  <p className="text-muted-foreground mb-2">
                    When you upload a file, CampaignCraft automatically:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Stores the file securely in cloud storage</li>
                    <li>Extracts text content from PDFs and DOCX files</li>
                    <li>Combines extracted text with your manual notes</li>
                    <li>Includes everything in the AI generation prompt</li>
                  </ol>
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-950/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Upload style guides, past campaign examples, or story summaries 
                    to give the AI rich context. The more relevant materials you provide, the better your results!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-models" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <div className="text-left">
                    <div className="font-semibold">AI Model Selection</div>
                    <div className="text-sm text-muted-foreground">Choose the right AI for your needs</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Available AI Models</h3>
                  <p className="text-muted-foreground mb-4">
                    CampaignCraft offers three powerful AI models, each with unique strengths:
                  </p>
                </div>

                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">GPT-5 (Default)</CardTitle>
                      <CardDescription>OpenAI's most capable model</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <strong>Best for:</strong> General-purpose campaign generation, creative writing, and balanced performance
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Claude Sonnet 4</CardTitle>
                      <CardDescription>Anthropic's advanced reasoning model</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <strong>Best for:</strong> Nuanced messaging, detailed analysis, and thoughtful campaign evaluation
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Gemini 2.5 Flash</CardTitle>
                      <CardDescription>Google's fast and efficient model</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <strong>Best for:</strong> Quick iterations, rapid prototyping, and cost-effective generation
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How to Select a Model</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Open Campaign Builder or Campaign Form</li>
                    <li>Look for the AI model dropdown</li>
                    <li>Select your preferred model</li>
                    <li>Generate campaigns - the selected model will be used</li>
                  </ol>
                </div>

                <div className="bg-pink-50 dark:bg-pink-950/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Try different models for the same campaign and compare results. 
                    Each model has a unique "personality" and may offer different creative approaches.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="campaign-history" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-indigo-500" />
                  <div className="text-left">
                    <div className="font-semibold">Campaign History</div>
                    <div className="text-sm text-muted-foreground">Track and manage all your campaigns</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">What is Campaign History?</h3>
                  <p className="text-muted-foreground mb-4">
                    Campaign History is your central hub for viewing, managing, and evaluating all generated campaigns. 
                    It provides a comprehensive view of your marketing work.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>View All Campaigns:</strong> See every campaign created by your newsroom</li>
                    <li><strong>Filter & Search:</strong> Find campaigns by objective, date, or AI model</li>
                    <li><strong>Quick Actions:</strong>
                      <ul className="ml-6 mt-1 space-y-1">
                        <li>• Copy subject line or body text</li>
                        <li>• Evaluate campaign quality</li>
                        <li>• Archive or delete campaigns</li>
                      </ul>
                    </li>
                    <li><strong>AI Model Tracking:</strong> See which AI model generated each campaign</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Use Campaign History to build a knowledge base of successful campaigns. 
                    Review high-performing campaigns to identify patterns and best practices.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="story-summaries" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-semibold">Story Summaries</div>
                    <div className="text-sm text-muted-foreground">AI-powered article summaries for campaigns</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">What are Story Summaries?</h3>
                  <p className="text-muted-foreground mb-4">
                    Story Summaries use AI to condense full news articles into concise, campaign-ready summaries. 
                    Perfect for promoting stories in email campaigns.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Creating Story Summaries</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to <strong>Story Summaries</strong> in the sidebar</li>
                    <li>Click <strong>"Create Summary"</strong></li>
                    <li>Paste the article URL or full text</li>
                    <li>AI generates a concise summary highlighting key points</li>
                    <li>Use summaries as reference materials in Campaign Builder</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm">
                    <strong>💡 Pro Tip:</strong> Create summaries for your newsroom's featured stories. 
                    Reference them in Campaign Builder to promote specific articles effectively.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="admin-features" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-500" />
                  <div className="text-left">
                    <div className="font-semibold">Admin Features</div>
                    <div className="text-sm text-muted-foreground">User management, prompts, and system logs</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Admin Control Panel</h3>
                  <p className="text-muted-foreground mb-4">
                    Administrators have access to advanced features for managing users, AI prompts, and system monitoring.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Admin-Only Features</h4>
                  <div className="space-y-3">
                    <div>
                      <strong>User Management:</strong>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1 ml-4">
                        <li>• Create, edit, and delete user accounts</li>
                        <li>• Assign users to newsrooms</li>
                        <li>• Set user roles (admin vs. regular user)</li>
                        <li>• Reset passwords</li>
                      </ul>
                    </div>
                    <div>
                      <strong>AI Prompt Management:</strong>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1 ml-4">
                        <li>• View and edit all AI prompts</li>
                        <li>• Update prompt templates without code changes</li>
                        <li>• Organize prompts by category</li>
                        <li>• Version control for prompts</li>
                      </ul>
                    </div>
                    <div>
                      <strong>System Logs:</strong>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1 ml-4">
                        <li>• View application logs and errors</li>
                        <li>• Track user activity</li>
                        <li>• Flag users for testing or bug reporting</li>
                        <li>• Monitor system health</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-sm">
                    <strong>⚠️ Admin Access:</strong> These features are only available to users with admin roles. 
                    Contact your system administrator if you need access.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="settings" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <div className="font-semibold">Settings & Preferences</div>
                    <div className="text-sm text-muted-foreground">Customize your CampaignCraft experience</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold mb-2">Available Settings</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Profile Settings:</strong> Update your name, email, and password</li>
                    <li><strong>Theme:</strong> Switch between light, dark, and system themes</li>
                    <li><strong>Newsroom Info:</strong> View your newsroom details and membership</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How to Access Settings</h4>
                  <p className="text-muted-foreground">
                    Click <strong>Settings</strong> in the sidebar to update your preferences and account information.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Need More Help?
              </CardTitle>
              <CardDescription>
                We're here to support you in creating amazing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Still have questions?</strong> Contact your system administrator or newsroom lead for additional support.
              </p>
              <p>
                <strong>Feature request?</strong> We're always improving CampaignCraft based on user feedback. 
                Share your ideas with your admin team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
