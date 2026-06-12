import { SignIn } from "@clerk/react";
import { useAuth } from "@clerk/react";
import { Redirect } from "wouter";

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#ef3e36] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">Tyre Tracker</h1>
          <p className="text-sm text-[#8e8e93] mt-1">Sign in to access your session data</p>
        </div>
        <SignIn
          routing="hash"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#ef3e36",
              colorBackground: "#1c1c1e",
              colorText: "#f5f5f7",
              colorTextSecondary: "#8e8e93",
              colorInputBackground: "#2c2c2e",
              colorInputText: "#f5f5f7",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "shadow-none border border-[#3a3a3c]",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
