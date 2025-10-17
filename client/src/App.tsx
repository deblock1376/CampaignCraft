import { Switch, Route } from "wouter";
import React, { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NewCampaign from "@/pages/new-campaign";
import CampaignHistory from "@/pages/campaign-history";
import CampaignEvaluate from "@/pages/campaign-evaluate";
import BrandStylesheets from "@/pages/brand-stylesheets";
import EmailOptimizer from "@/pages/email-optimizer";
import Segments from "@/pages/segments";
import Settings from "@/pages/settings";
import GuidedAssistant from "@/pages/guided-assistant";
import Admin from "@/pages/admin";
import AdminPrompts from "@/pages/admin-prompts";
import AdminLogs from "@/pages/admin-logs";
import AdminUsers from "@/pages/admin-users";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import CampaignAssistantTest from "@/pages/campaign-assistant-test";
import StorySummaries from "@/pages/story-summaries";
import HelpCenter from "@/pages/help-center";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("user");
  });

  // Listen for storage changes to update auth state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("user"));
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/campaigns/new" component={NewCampaign} />
      <Route path="/campaigns/assistant-test" component={CampaignAssistantTest} />
      <Route path="/campaigns/evaluate" component={CampaignEvaluate} />
      <Route path="/campaigns/history" component={CampaignHistory} />
      <Route path="/assistant" component={GuidedAssistant} />
      <Route path="/stylesheets" component={BrandStylesheets} />
      <Route path="/story-summaries" component={StorySummaries} />
      <Route path="/segments" component={Segments} />
      <Route path="/email-optimizer" component={EmailOptimizer} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/prompts" component={AdminPrompts} />
      <Route path="/admin/logs" component={AdminLogs} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-slate-50">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
