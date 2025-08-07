import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuickStartModal from "./quick-start-modal";

const quickStartTools = [
  {
    id: 'rapid-response',
    name: "Create Rapid-Response Campaign",
    description: "Generate breaking news campaigns in minutes with AI-powered content",
    icon: "fas fa-bolt",
    type: "campaign",
    setupTime: "2-3 min setup",
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: 'rewrite-segments',
    name: "Re-write Campaigns for Segments", 
    description: "Automatically adapt existing campaigns for different audience segments",
    icon: "fas fa-users",
    type: "optimization",
    setupTime: "3-4 min setup", 
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: 'subject-lines',
    name: "Suggest Subject Lines",
    description: "Generate compelling email subject lines that boost open rates",
    icon: "fas fa-envelope",
    type: "content",
    setupTime: "1-2 min setup",
    bgColor: "bg-blue-100", 
    iconColor: "text-blue-600",
  },
  {
    id: 'cta-buttons',
    name: "Suggest Button CTAs",
    description: "Create persuasive call-to-action buttons that drive conversions",
    icon: "fas fa-hand-pointer",
    type: "content", 
    setupTime: "1-2 min setup",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 'grounding-library',
    name: "Build a Grounding Library",
    description: "Create comprehensive brand guidelines from your existing content",
    icon: "fas fa-book",
    type: "setup",
    setupTime: "4-5 min setup",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  }
];

export default function QuickStartTemplates() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    setIsModalOpen(true);
  };

  const selectedToolData = quickStartTools.find(tool => tool.id === selectedTool);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStartTools.map((tool) => (
              <div 
                key={tool.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group hover:shadow-md"
                onClick={() => handleToolClick(tool.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.bgColor}`}>
                    <i className={`${tool.icon} ${tool.iconColor} text-sm`}></i>
                  </div>
                  <Badge variant="outline">{tool.type}</Badge>
                </div>
                <h4 className="font-medium text-slate-900 mb-2 group-hover:text-primary">
                  {tool.name}
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  {tool.description}
                </p>
                <div className="flex items-center text-xs text-slate-500">
                  <i className="fas fa-clock mr-1"></i>
                  <span>{tool.setupTime}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedToolData && (
        <QuickStartModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTool(null);
          }}
          tool={selectedTool!}
          title={selectedToolData.name}
          description={selectedToolData.description}
          icon={selectedToolData.icon}
        />
      )}
    </>
  );
}