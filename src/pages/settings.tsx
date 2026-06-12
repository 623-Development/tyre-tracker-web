import { useUser, useClerk } from "@clerk/react";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const initials = user
    ? ((user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.primaryEmailAddress?.emailAddress?.[0] ?? "")).toUpperCase()
    : "?";

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight mb-6">Settings</h1>

      <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-5 mb-4">
        <div className="text-xs font-bold text-[#8e8e93] uppercase tracking-widest mb-3">Account</div>
        {isLoaded && user ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ef3e36] flex items-center justify-center text-white font-bold text-base shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              {(user.firstName || user.lastName) && (
                <div className="text-sm font-semibold text-[#f5f5f7]">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                </div>
              )}
              <div className="text-sm text-[#8e8e93] truncate">
                {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-12 bg-[#2c2c2e] rounded-lg animate-pulse" />
        )}
      </div>

      <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-5 mb-4">
        <div className="text-xs font-bold text-[#8e8e93] uppercase tracking-widest mb-3">About</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8e8e93]">App</span>
            <span className="text-[#f5f5f7]">Tyre Tracker Web</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8e8e93]">Version</span>
            <span className="text-[#f5f5f7]">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8e8e93]">Pressure tolerance</span>
            <span className="text-[#f5f5f7]">±0.5 psi / ±0.035 bar</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut({ redirectUrl: "/sign-in" })}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1c1c1e] text-[#ff453a] border border-[#ff453a]/30 rounded-xl hover:bg-[#ff453a]/10 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        Sign Out
      </button>
    </div>
  );
}
