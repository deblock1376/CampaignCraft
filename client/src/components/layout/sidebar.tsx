import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  
  
  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === 'admin';
  const isSuperAdmin = currentUser.role === 'admin' && currentUser.newsroomId === null;

  // Main navigation items in priority order
  const navItems = [
    { href: "/", icon: "fas fa-home", label: "Dashboard" },
    { href: "/campaign-builder", icon: "fas fa-comments", label: "Campaign Builder" },
    { href: "/campaigns/saved", icon: "fas fa-bookmark", label: "Saved Campaigns" },
    { href: "/campaigns/history", icon: "fas fa-history", label: "Campaign History" },
    { href: "/campaign-planner", icon: "fas fa-calendar-alt", label: "Campaign Planner" },
    { href: "/stylesheets", icon: "fas fa-palette", label: "Grounding Library" },
    { href: "/segments", icon: "fas fa-users", label: "Audience Segments" },
    { href: "/story-summaries", icon: "fas fa-newspaper", label: "Story Summaries" },
    { href: "/settings", icon: "fas fa-cog", label: "Settings" },
    { href: "/help", icon: "fas fa-book-open", label: "Help & Guides" },
  ];


  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link href="/">
          <img 
            src="/bluelena-logo.png" 
            alt="BlueLena" 
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation Items */}
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

        {/* Admin Control (if admin) */}
        {isAdmin && (
          <Link href="/admin">
            <div className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
              location === "/admin"
                ? "bg-primary text-white" 
                : "text-slate-600 hover:bg-slate-100"
            )}>
              <i className="fas fa-shield-alt w-4"></i>
              <span>Admin Control</span>
            </div>
          </Link>
        )}
      </nav>
      
      {/* Marketing Assistant Box at Bottom */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Link href="/assistant">
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <i className="fas fa-user-friends text-lg"></i>
              <span className="font-semibold">Marketing Assistant</span>
            </div>
            <p className="text-xs text-white/90">Quick start templates and guided workflows</p>
          </div>
        </Link>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-white">
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
