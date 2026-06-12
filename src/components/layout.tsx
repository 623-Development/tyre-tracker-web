import { useLocation, Link } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
      <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
function TyreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  );
}
function SetupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <DashIcon /> },
  { href: "/sessions", label: "Sessions", icon: <ClockIcon /> },
  { href: "/cars", label: "Vehicles", icon: <CarIcon /> },
  { href: "/compounds", label: "Compounds", icon: <TyreIcon /> },
  { href: "/setups", label: "Setups", icon: <SetupIcon /> },
];

function NavLink({ item }: { item: NavItem }) {
  const [location] = useLocation();
  const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));

  return (
    <Link href={item.href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
          active
            ? "bg-[#ef3e36]/15 text-[#ef3e36]"
            : "text-[#8e8e93] hover:text-[#f5f5f7] hover:bg-[#2c2c2e]"
        )}
      >
        <span className="shrink-0">{item.icon}</span>
        <span>{item.label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ef3e36]" />}
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const initials = user
    ? (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.primaryEmailAddress?.emailAddress?.[0] ?? "")
    : "?";

  return (
    <div className="flex h-screen bg-[#0d0d0f] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-[#3a3a3c] bg-[#111113]">
        {/* Logo */}
        <div className="px-4 pt-6 pb-4 border-b border-[#3a3a3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#ef3e36] flex items-center justify-center">
              <TyreIcon />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#f5f5f7] tracking-tight leading-none">TYRE</div>
              <div className="text-[10px] text-[#8e8e93] tracking-widest uppercase leading-none mt-0.5">TRACKER</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* User / Settings */}
        <div className="p-3 border-t border-[#3a3a3c] space-y-0.5">
          <NavLink item={{ href: "/settings", label: "Settings", icon: <SettingsIcon /> }} />
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1">
              <div className="w-7 h-7 rounded-full bg-[#ef3e36] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {initials.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-[#f5f5f7] truncate">
                  {user.firstName ?? user.primaryEmailAddress?.emailAddress ?? "User"}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
