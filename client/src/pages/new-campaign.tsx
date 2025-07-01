import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import CampaignForm from "@/components/campaign/campaign-form";
import TemplateLibrary from "@/components/campaign/template-library";

export default function NewCampaign() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header 
          title="Campaign Generator" 
          subtitle="Create AI-powered marketing campaigns for your newsroom"
        />
        
        <div className="flex-1 overflow-y-scroll p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-8">
            <CampaignForm />
            <TemplateLibrary />
          </div>
        </div>
      </main>
    </>
  );
}
