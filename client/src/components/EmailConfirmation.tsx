import AuthLayout from "@/components/AuthLayout";

interface EmailConfirmationProps {
  email: string;
  onSendAnother: () => void;
}

export default function EmailConfirmation({ email, onSendAnother }: EmailConfirmationProps) {
  return (
    <AuthLayout>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white rounded-lg p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-electric-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-aura-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
          <p className="text-gray-600 mb-8">
            We've sent a secure login link to <strong className="text-gray-900">{email}</strong>
          </p>
          <button
            onClick={onSendAnother}
            className="flex w-full justify-center rounded-md bg-electric-400 px-3 py-2 text-sm font-semibold text-aura-600 hover:bg-electric-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-400 disabled:bg-electric-600 disabled:text-aura-600 disabled:cursor-not-allowed shadow-lg"
          >
            Send another link
          </button>
        </div>

        <p className="mt-6 text-center text-sm/6 text-gray-300">
          New to RampLO?{' '}
          <a href="/" className="font-semibold text-electric-400 hover:text-electric-200 ml-2">
            Learn more
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}