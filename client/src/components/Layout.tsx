import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import PaywallOverlay from "./PaywallOverlay";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronRight } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { isMortyUser, hasActiveSubscription, profile } = useAuth();
  const [location] = useLocation();
  
  const isOnboarding = location === "/onboarding" || (location === "/" && !profile?.onboardingCompleted);
  
  // Pages that non-Morty users can access
  const allowedPagesForNonMorty = ["/onboarding", "/billing"];
  const isAllowedPage = allowedPagesForNonMorty.some(page => location.startsWith(page)) || 
                       (location === "/" && !profile?.onboardingCompleted);
  
  // Show paywall for non-Morty users who don't have active subscription and are on restricted pages
  const shouldShowPaywall = !isMortyUser && !hasActiveSubscription && !isAllowedPage && profile?.onboardingCompleted;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnboarding && (
        <Sidebar isExpanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      )}
      
      {/* Main content */}
      <div className={`transition-all duration-300 ${!isOnboarding ? (sidebarExpanded ? 'ml-64' : 'ml-16') : ''}`}>
        {children}
      </div>

      {/* Paywall for non-Morty users without subscription on restricted pages */}
      {shouldShowPaywall && <PaywallOverlay />}
    </div>
  );
}
