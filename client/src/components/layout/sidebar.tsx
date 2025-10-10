import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const [groundingLibraryOpen, setGroundingLibraryOpen] = useState(false);
  
  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.email === 'admin@campaigncraft.com';

  const baseNavItems = [
    { href: "/", icon: "fas fa-home", label: "Dashboard" },
    { href: "/campaigns/new", icon: "fas fa-plus-circle", label: "New Campaign" },
    { href: "/campaigns/history", icon: "fas fa-history", label: "Campaign History" },
    { href: "/assistant", icon: "fas fa-user-friends", label: "Marketing Assistant" },
    { href: "/segments", icon: "fas fa-users", label: "Audience Segments" },
    { href: "/email-optimizer", icon: "fas fa-envelope", label: "Email Optimizer" },
    { href: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  // Only add admin control for admin@campaigncraft.com
  const navItems = isAdmin 
    ? [...baseNavItems, { href: "/admin", icon: "fas fa-shield-alt", label: "Admin Control" }]
    : baseNavItems;

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
        
        {/* Grounding Library Dropdown */}
        <div className="space-y-1">
          <div 
            onClick={() => setGroundingLibraryOpen(!groundingLibraryOpen)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
              location === "/stylesheets" || location === "/assistant"
                ? "bg-primary text-white" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-palette w-4"></i>
              <span>Grounding Library</span>
            </div>
            {groundingLibraryOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          
          {groundingLibraryOpen && (
            <div className="ml-7 space-y-1">
              <Link href="/stylesheets">
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                  location === "/stylesheets"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                )}>
                  View Libraries
                </div>
              </Link>
              <Link href="/assistant">
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                  location === "/assistant"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                )}>
                  Create a Grounding Library
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-primary text-sm"></i>
          </div>
          <div className="flex-1">
            {(() => {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                const user = JSON.parse(userStr);
                return (
                  <>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.newsroom?.name || "Admin"}</p>
                  </>
                );
              }
              return (
                <>
                  <p className="text-sm font-medium text-slate-900">Newsroom Admin</p>
                  <p className="text-xs text-slate-500">Campaign Manager</p>
                </>
              );
            })()}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
