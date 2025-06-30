import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NewCampaign from "@/pages/new-campaign";
import CampaignHistory from "@/pages/campaign-history";
import BrandStylesheets from "@/pages/brand-stylesheets";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const user = localStorage.getItem("user");
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/campaigns/new" component={NewCampaign} />
      <Route path="/campaigns/history" component={CampaignHistory} />
      <Route path="/stylesheets" component={BrandStylesheets} />
      <Route path="/settings" component={Settings} />
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
