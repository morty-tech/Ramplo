import { useState } from "react";
import Sidebar from "./Sidebar";
import PaywallOverlay from "./PaywallOverlay";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronRight } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { isMortyUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      
      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-16'}`}>
        {children}
      </div>

      {/* Paywall for non-Morty users */}
      {!isMortyUser && <PaywallOverlay />}
    </div>
  );
}
