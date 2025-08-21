import rampLoWhiteLogo from "@assets/ramplo-log-white_1755552246908.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function AuthLayout({ children, showFooter = true }: AuthLayoutProps) {
  return (
    <div className="h-screen bg-gradient-to-br from-aura-600 to-eclipse-800 relative isolate overflow-hidden">
      {/* Top lime glow gradient burst */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#84cc16] to-[#22c55e] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      {/* Bottom lime glow gradient burst */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#65a30d] to-[#16a34a] opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      <div className="flex h-full flex-col justify-between px-6 py-12 lg:px-8 relative z-10">
        <div className="flex-1 flex flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="flex items-center justify-center">
              <img 
                src={rampLoWhiteLogo} 
                alt="RampLO" 
                className="h-8 w-auto"
              />
            </div>
          </div>
          
          {children}
        </div>
        
        {showFooter && (
          <div className="text-center py-6">
            <p className="text-sm text-white/70">
              © 2025 RampLO powered by Morty
            </p>
          </div>
        )}
      </div>
    </div>
  );
}