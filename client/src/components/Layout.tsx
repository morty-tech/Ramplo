import { useState } from "react";
import Sidebar from "./Sidebar";
import PaywallOverlay from "./PaywallOverlay";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronRight } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMortyUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-primary hover:opacity-90 text-white p-3 rounded-lg shadow-lg transition-all duration-200"
            aria-label="Open menu"
            style={{ backgroundColor: 'hsl(217, 91%, 60%)' }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {children}
      </div>

      {/* Paywall for non-Morty users */}
      {!isMortyUser && <PaywallOverlay />}
    </div>
  );
}
