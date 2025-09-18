import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import GuidedAssistant from "@/components/guided-assistant/guided-assistant";
import QuickStartModal from "@/components/quickstart/quick-start-modal";

export default function GuidedAssistantPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState({
    id: '',
    title: '',
    description: '',
    icon: ''
  });

  const handleToolSelect = (toolId: string, toolTitle: string, toolDescription: string, toolIcon: string) => {
    setSelectedTool({
      id: toolId,
      title: toolTitle,
      description: toolDescription,
      icon: toolIcon
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTool({ id: '', title: '', description: '', icon: '' });
  };

  return (
    <>
      <Header title="Marketing Assistant" subtitle="Step-by-step guide to creating campaigns and content" />
      <main className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <GuidedAssistant onToolSelect={handleToolSelect} />
          </div>
        </div>
      </main>

      <QuickStartModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        tool={selectedTool.id}
        title={selectedTool.title}
        description={selectedTool.description}
        icon={selectedTool.icon}
      />
    </>
  );
}