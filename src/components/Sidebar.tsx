import { useState } from "react";
import { Button } from "./ui/button";
import { 
  Home, 
  Calendar, 
  Users, 
  Target, 
  Settings, 
  LogOut, 
  BarChart3, 
  Mail,
  FileText,
  HeadphonesIcon
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: "dashboard" | "campaign-detail" | "cadences" | "cadence-detail" | "new-cadence" | "prospect-upload" | "account-settings" | "meetings" | "reports" | "templates" | "prospects" | "support") => void;
  user: {
    email: string;
    name: string;
    isAuthenticated: boolean;
  };
  onLogout: () => void;
}

export function Sidebar({ currentView, onNavigate, user, onLogout }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      view: "dashboard" as const
    },
    {
      id: "meetings",
      label: "Calendar & Meetings",
      icon: Calendar,
      view: "meetings" as const
    },
    {
      id: "cadences",
      label: "Cadences",
      icon: Target,
      view: "cadences" as const
    },
    {
      id: "templates",
      label: "Templates",
      icon: Mail,
      view: "templates" as const
    },
    {
      id: "prospects",
      label: "Prospects",
      icon: Users,
      view: "prospects" as const
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      view: "reports" as const
    },
    {
      id: "account-settings",
      label: "Account Settings",
      icon: Settings,
      view: "account-settings" as const
    }
  ];

  return (
    <div className="sidebar-container bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              {/* Left page */}
              <path d="M3 5h8v14H3c-0.55 0-1-0.45-1-1V6c0-0.55 0.45-1 1-1z"/>
              {/* Right page */}
              <path d="M13 5h8c0.55 0 1 0.45 1 1v12c0 0.55-0.45 1-1 1h-8V5z"/>
              {/* Center spine crease */}
              <path d="M11 5v14h2V5h-2z" opacity="0.6"/>
              
              {/* Page content lines - left side */}
              <rect x="4.5" y="7" width="5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="9" width="4.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="11" width="5.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="4.5" y="13" width="4" height="0.8" rx="0.4" opacity="0.4"/>
              
              {/* Page content lines - right side */}
              <rect x="14.5" y="7" width="5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="14.5" y="9" width="4.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="14.5" y="11" width="5.5" height="0.8" rx="0.4" opacity="0.4"/>
              <rect x="14.5" y="13" width="4" height="0.8" rx="0.4" opacity="0.4"/>
            </svg>
          </div>
          <span className="text-2xl font-semibold text-gray-900">Booky</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  currentView === item.view
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-base font-medium text-gray-900 truncate">{user.name}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("support")}
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-base"
          >
            <HeadphonesIcon className="h-5 w-5 mr-2" />
            Support
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-base"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}