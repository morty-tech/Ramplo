import TransparentFooter from "@/components/TransparentFooter";

interface EmailConfirmationProps {
  email: string;
  onSendAnother: () => void;
}

export default function EmailConfirmation({ email, onSendAnother }: EmailConfirmationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-800 to-tealwave-800 relative isolate">
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
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#65a30d] to-[#16a34a] opacity-25 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-forest-800 font-bold text-xl">R</span>
            </div>
            <span className="text-white font-bold text-2xl">RampLO</span>
          </div>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="bg-white rounded-lg p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-limeglow-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-forest-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-8">
              We've sent a secure login link to <strong className="text-gray-900">{email}</strong>
            </p>
            <button
              onClick={onSendAnother}
              className="flex w-full justify-center rounded-md bg-limeglow-400 px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-limeglow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-limeglow-400 disabled:bg-limeglow-600 disabled:text-forest-800 disabled:cursor-not-allowed shadow-lg"
            >
              Send another link
            </button>
          </div>

          <p className="mt-6 text-center text-sm/6 text-gray-300">
            New to RampLO?{' '}
            <a href="/" className="font-semibold text-limeglow-400 hover:text-limeglow-300 ml-2">
              Learn more
            </a>
          </p>
        </div>
      </div>
      
      <TransparentFooter />
    </div>
  );
}