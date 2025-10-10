import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface GroundingLibraryMaterials {
  brandFoundation: {
    brandVoice?: { text?: string; fileUrl?: string };
    strategyPlaybook?: { text?: string; fileUrl?: string };
    styleGuide?: { text?: string; fileUrl?: string };
    aboutUs?: { text?: string; fileUrl?: string };
  };
  campaignExamples: {
    pastCampaigns?: { text?: string; fileUrl?: string };
    impactStories?: { text?: string; fileUrl?: string };
    testimonials?: { text?: string; fileUrl?: string };
  };
  audienceIntelligence: {
    segments?: { text?: string; fileUrl?: string };
    surveyResponses?: { text?: string; fileUrl?: string };
    localDates?: { text?: string; fileUrl?: string };
  };
  performanceData: {
    surveyResearch?: { text?: string; fileUrl?: string };
    campaignMetrics?: { text?: string; fileUrl?: string };
  };
}

interface GroundingLibraryFormProps {
  materials: GroundingLibraryMaterials;
  onChange: (materials: GroundingLibraryMaterials) => void;
  onFileUpload?: (category: string, field: string, file: File) => Promise<string>;
}

export default function GroundingLibraryForm({ materials, onChange, onFileUpload }: GroundingLibraryFormProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const updateMaterial = (category: keyof GroundingLibraryMaterials, field: string, type: 'text' | 'fileUrl', value: string) => {
    const categoryData = materials[category] || {};
    const currentMaterial = (categoryData as any)[field] || {};
    
    onChange({
      ...materials,
      [category]: {
        ...categoryData,
        [field]: {
          ...currentMaterial,
          [type]: value
        }
      }
    });
  };

  const handleFileUpload = async (category: keyof GroundingLibraryMaterials, field: string, file: File) => {
    if (!onFileUpload) return;
    
    const uploadKey = `${category}-${field}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
    
    try {
      const fileUrl = await onFileUpload(String(category), field, file);
      updateMaterial(category, field, 'fileUrl', fileUrl);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const getMaterialStatus = (category: keyof GroundingLibraryMaterials, field: string) => {
    const categoryData = materials[category];
    if (!categoryData) return false;
    const material = (categoryData as any)[field];
    return material && (material.text || material.fileUrl);
  };

  const getCategoryProgress = (category: keyof GroundingLibraryMaterials, fieldCount: number) => {
    const categoryData = materials[category];
    if (!categoryData) return 0;
    
    const filledCount = Object.keys(categoryData).filter(key => {
      const material = (categoryData as any)[key];
      return material && (material.text || material.fileUrl);
    }).length;
    
    return filledCount;
  };

  const MaterialInput = ({ 
    category, 
    field, 
    label, 
    placeholder 
  }: { 
    category: keyof GroundingLibraryMaterials; 
    field: string; 
    label: string; 
    placeholder: string;
  }) => {
    const categoryData = materials[category];
    const material = categoryData ? (categoryData as any)[field] : null;
    const hasContent = getMaterialStatus(category, field);
    const isUploading = uploadingFiles[`${category}-${field}`];

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            {label}
            {hasContent && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          </Label>
          {material?.fileUrl && (
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              File uploaded
            </Badge>
          )}
        </div>
        
        <Textarea
          value={material?.text || ''}
          onChange={(e) => updateMaterial(category, field, 'text', e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="text-sm"
        />
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Or</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading || !onFileUpload}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.doc,.docx,.txt';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(category, field, file);
              };
              input.click();
            }}
          >
            <Upload className="h-3 w-3 mr-1" />
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Add any materials you have to build a comprehensive grounding library. All materials are optional.
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        {/* Brand Foundation */}
        <AccordionItem value="brand-foundation" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">📋 Brand Foundation</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getCategoryProgress('brandFoundation', 4)} of 4 added
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <MaterialInput
              category="brandFoundation"
              field="brandVoice"
              label="Brand Voice & Mission"
              placeholder="Describe your newsroom's mission, values, target audience, and brand voice. Include details about what makes your organization unique and how you communicate with your community..."
            />
            <MaterialInput
              category="brandFoundation"
              field="strategyPlaybook"
              label="Strategy Playbook"
              placeholder="Paste your strategy playbook or key strategic priorities..."
            />
            <MaterialInput
              category="brandFoundation"
              field="styleGuide"
              label="Brand/Style Guide"
              placeholder="Paste your brand guidelines, style guide, or writing standards..."
            />
            <MaterialInput
              category="brandFoundation"
              field="aboutUs"
              label="About Us Statement"
              placeholder="Paste your About Us or organizational overview..."
            />
          </AccordionContent>
        </AccordionItem>

        {/* Campaign Examples */}
        <AccordionItem value="campaign-examples" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">📧 Campaign Examples</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getCategoryProgress('campaignExamples', 3)} of 3 added
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <MaterialInput
              category="campaignExamples"
              field="pastCampaigns"
              label="Past Campaigns (3-4 examples)"
              placeholder="Paste examples of successful past campaigns, including one from each sender if applicable..."
            />
            <MaterialInput
              category="campaignExamples"
              field="impactStories"
              label="Impact News Stories"
              placeholder="Paste examples of impact stories you would feature in campaigns..."
            />
            <MaterialInput
              category="campaignExamples"
              field="testimonials"
              label="Reader Testimonials"
              placeholder="Paste reader testimonials or feedback..."
            />
          </AccordionContent>
        </AccordionItem>

        {/* Audience Intelligence */}
        <AccordionItem value="audience-intelligence" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">👥 Audience Intelligence</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getCategoryProgress('audienceIntelligence', 3)} of 3 added
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <MaterialInput
              category="audienceIntelligence"
              field="segments"
              label="Audience Segments"
              placeholder="Describe your audience segments with data for each (demographics, engagement levels, etc.)..."
            />
            <MaterialInput
              category="audienceIntelligence"
              field="surveyResponses"
              label="Audience Survey Responses"
              placeholder="Paste key findings from audience surveys..."
            />
            <MaterialInput
              category="audienceIntelligence"
              field="localDates"
              label="Key Local Dates"
              placeholder="List important local dates (elections, holidays, school start dates, etc.)..."
            />
          </AccordionContent>
        </AccordionItem>

        {/* Performance Data */}
        <AccordionItem value="performance-data" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">📊 Performance Data</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getCategoryProgress('performanceData', 2)} of 2 added
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <MaterialInput
              category="performanceData"
              field="surveyResearch"
              label="Survey & Research Data"
              placeholder="Paste survey findings, research reports, reader insights, or audience feedback data..."
            />
            <MaterialInput
              category="performanceData"
              field="campaignMetrics"
              label="Performance Metrics & Analytics"
              placeholder="Paste performance data from similar campaigns (subject lines with open rates, CTAs with click rates, impact reports, annual reports, etc.)..."
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
