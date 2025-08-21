import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { 
  Home,
  Map,
  Send,
  UserCheck,
  CreditCard,
  LogOut,
  ChevronRight
} from "lucide-react";
import rampLoWhiteLogo from "@assets/ramplo-log-white_1755552246908.png";
import rampLoFaviconWhite from "@assets/ramplo-favicon-white_1755552876821.png";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "90-Day Roadmap", href: "/roadmap", icon: Map },
  { name: "Outreach Templates", href: "/outreach", icon: Send },
  { name: "Deal Coach", href: "/deal-coach", icon: UserCheck },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

export default function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user, profile } = useAuth();
  const [showText, setShowText] = useState(isExpanded);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Manage text visibility during transitions
  useEffect(() => {
    if (isExpanded) {
      // Show text after expansion animation completes (300ms duration)
      const timer = setTimeout(() => setShowText(true), 300);
      return () => clearTimeout(timer);
    } else {
      // Hide text immediately when collapsing
      setShowText(false);
    }
  }, [isExpanded]);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-aura-600 shadow-lg transition-all duration-300 flex flex-col",
      isExpanded ? "w-64" : "w-16"
    )}>
      
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 flex-shrink-0">
        {isExpanded ? (
          <>
            {showText && (
              <img 
                src={rampLoWhiteLogo} 
                alt="RampLO" 
                className="h-6 w-auto transition-opacity duration-200 opacity-100"
              />
            )}
            <button
              onClick={onToggle}
              className="ml-auto text-white hover:bg-white hover:bg-opacity-10 p-1 rounded transition-colors"
              aria-label="Collapse menu"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors"
            aria-label="Expand menu"
          >
            <img 
              src={rampLoFaviconWhite} 
              alt="RampLO" 
              className="w-6 h-6 rounded-sm"
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  setLocation(item.href);
                }}
                className={cn(
                  "w-full flex items-center transition-all duration-200 rounded-lg",
                  isExpanded ? "px-4 py-3 justify-start" : "px-3 py-3 justify-center",
                  isActive
                    ? "bg-white bg-opacity-20 text-white font-medium"
                    : "text-white text-opacity-80 hover:bg-white hover:bg-opacity-10 hover:text-white"
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {showText && <span className="ml-3 transition-opacity duration-200 opacity-100">{item.name}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-white border-opacity-20 p-2 flex-shrink-0">
        {isExpanded ? (
          <div className="px-2">
            <div className="flex items-center px-2 py-2 mb-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {profile?.firstName?.[0] || user?.firstName?.[0]}{profile?.lastName?.[0] || user?.lastName?.[0]}
                </span>
              </div>
              {showText && (
                <div className="flex-1 min-w-0 transition-opacity duration-200 opacity-100">
                  <div className="text-sm font-medium text-white truncate">
                    {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
                  </div>
                  <div className="text-xs text-white text-opacity-70 truncate">
                    {user?.email}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-left rounded-lg text-white text-opacity-80 hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              {showText && <span className="transition-opacity duration-200 opacity-100">Sign out</span>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {profile?.firstName?.[0] || user?.firstName?.[0]}{profile?.lastName?.[0] || user?.lastName?.[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white text-opacity-80 hover:bg-white hover:bg-opacity-10 hover:text-white rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}