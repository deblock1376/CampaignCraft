import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: "fas fa-home", label: "Dashboard" },
    { href: "/campaigns/new", icon: "fas fa-plus-circle", label: "New Campaign" },
    { href: "/campaigns/history", icon: "fas fa-history", label: "Campaign History" },
    { href: "/stylesheets", icon: "fas fa-palette", label: "Brand Stylesheets" },
    { href: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-magic text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">CampaignCraft</h1>
            <p className="text-xs text-slate-500">AI Marketing Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
              location === item.href 
                ? "bg-primary text-white" 
                : "text-slate-600 hover:bg-slate-100"
            )}>
              <i className={`${item.icon} w-4`}></i>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-primary text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">Newsroom Admin</p>
            <p className="text-xs text-slate-500">Campaign Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
