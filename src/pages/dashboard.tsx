import { useGetDashboard } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDate, getDeltaStatus, getDeltaColorClass, type WheelValues } from "@/lib/utils";

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-[#1c1c1e] rounded-xl p-4 border border-[#3a3a3c]">
      <div className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-bold text-[#f5f5f7] tabular-nums">{value}</div>
      {sub && <div className="text-xs text-[#8e8e93] mt-0.5">{sub}</div>}
    </div>
  );
}

function WheelDot({ hot, target }: { hot: number; target: number }) {
  const delta = hot - target;
  const status = getDeltaStatus(delta);
  return (
    <div className={`w-2 h-2 rounded-full ${status === "on" ? "bg-[#30d158]" : status === "over" ? "bg-[#ff453a]" : "bg-[#0a84ff]"}`} />
  );
}

interface RecentSession {
  id: string;
  carName: string;
  trackName: string;
  date: string;
  pressureUnit: string;
  hotPressures: WheelValues;
  targetPressures: WheelValues;
}

function RecentSessionRow({ s }: { s: RecentSession }) {
  const wheels: Array<keyof WheelValues> = ["fl", "fr", "rl", "rr"];
  return (
    <Link href={`/sessions/${s.id}`}>
      <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#2c2c2e] transition-colors cursor-pointer rounded-lg">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#f5f5f7] truncate">{s.trackName}</div>
          <div className="text-xs text-[#8e8e93] truncate">{s.carName} · {formatDate(s.date)}</div>
        </div>
        <div className="flex gap-1 items-center">
          {wheels.map((w) => (
            <WheelDot key={w} hot={(s.hotPressures as any)[w]} target={(s.targetPressures as any)[w]} />
          ))}
        </div>
        <svg className="w-4 h-4 text-[#3a3a3c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1c1c1e] rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const d = data ?? { sessionCount: 0, carCount: 0, compoundCount: 0, setupCount: 0, tracksVisited: 0, recentSessions: [] };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#8e8e93] mt-0.5">Your tyre pressure data at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Sessions" value={d.sessionCount} />
        <StatCard label="Vehicles" value={d.carCount} />
        <StatCard label="Compounds" value={d.compoundCount} />
        <StatCard label="Tracks" value={d.tracksVisited} />
      </div>

      <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3a3c]">
          <h2 className="text-sm font-semibold text-[#f5f5f7]">Recent Sessions</h2>
          <Link href="/sessions">
            <span className="text-xs text-[#ef3e36] hover:opacity-80 cursor-pointer font-medium">View all</span>
          </Link>
        </div>

        {d.recentSessions.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-[#8e8e93] text-sm">No sessions yet</div>
            <div className="text-xs text-[#3a3a3c] mt-1">Use the mobile app to log your first session</div>
          </div>
        ) : (
          <div className="divide-y divide-[#3a3a3c]/50">
            {d.recentSessions.map((s) => (
              <RecentSessionRow key={s.id} s={s as unknown as RecentSession} />
            ))}
          </div>
        )}
      </div>

      {d.setupCount > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/setups">
            <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-4 hover:border-[#ef3e36]/50 transition-colors cursor-pointer">
              <div className="text-xs text-[#8e8e93] uppercase tracking-widest mb-1">Setups</div>
              <div className="text-2xl font-bold text-[#f5f5f7]">{d.setupCount}</div>
              <div className="text-xs text-[#8e8e93] mt-0.5">Alignment configurations</div>
            </div>
          </Link>
          <Link href="/compounds">
            <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-4 hover:border-[#ef3e36]/50 transition-colors cursor-pointer">
              <div className="text-xs text-[#8e8e93] uppercase tracking-widest mb-1">Compounds</div>
              <div className="text-2xl font-bold text-[#f5f5f7]">{d.compoundCount}</div>
              <div className="text-xs text-[#8e8e93] mt-0.5">Tyre specifications</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
