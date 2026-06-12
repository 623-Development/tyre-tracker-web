import { useState } from "react";
import { useListSessions, useDeleteSession, getListSessionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDate, getDeltaStatus, type WheelValues } from "@/lib/utils";
import { toast } from "sonner";

type Session = {
  id: string;
  carName: string;
  trackName: string;
  date: string;
  pressureUnit: string;
  ambientTemp: number;
  tempUnit: string;
  hotPressures: WheelValues;
  targetPressures: WheelValues;
  notes: string;
};

function WheelStatusRow({ hot, target, unit }: { hot: WheelValues; target: WheelValues; unit: string }) {
  const wheels: Array<keyof WheelValues> = ["fl", "fr", "rl", "rr"];
  return (
    <div className="flex gap-1">
      {wheels.map((w) => {
        const delta = hot[w] - target[w];
        const status = getDeltaStatus(delta);
        return (
          <div
            key={w}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status === "on" ? "bg-[#30d158]/15 text-[#30d158]" : status === "over" ? "bg-[#ff453a]/15 text-[#ff453a]" : "bg-[#0a84ff]/15 text-[#0a84ff]"}`}
          >
            {hot[w].toFixed(1)}
          </div>
        );
      })}
      <span className="text-[10px] text-[#8e8e93] self-center ml-0.5">{unit}</span>
    </div>
  );
}

export default function SessionsPage() {
  const { data: sessions = [], isLoading } = useListSessions();
  const deleteSession = useDeleteSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = sessions.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [s.trackName, s.carName, s.notes, s.date].join(" ").toLowerCase().includes(q);
  });

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this session?")) return;
    setDeleting(id);
    try {
      await deleteSession.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">Sessions</h1>
          <p className="text-sm text-[#8e8e93] mt-0.5">{sessions.length} pressure sessions</p>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="w-full max-w-sm bg-[#2c2c2e] text-[#f5f5f7] placeholder-[#8e8e93] rounded-lg pl-9 pr-4 py-2 text-sm border border-[#3a3a3c] focus:outline-none focus:border-[#ef3e36]"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#1c1c1e] rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#2c2c2e] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#8e8e93]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div className="text-[#8e8e93] text-sm">No sessions found</div>
          <div className="text-xs text-[#3a3a3c] mt-1">Log sessions from the mobile app</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Link key={s.id} href={`/sessions/${s.id}`}>
              <div className="group bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] hover:border-[#ef3e36]/40 transition-all cursor-pointer overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#f5f5f7] truncate">{s.trackName}</span>
                      <span className="text-[11px] text-[#8e8e93] shrink-0">{s.ambientTemp}°{s.tempUnit}</span>
                    </div>
                    <div className="text-xs text-[#8e8e93] truncate mb-2">{s.carName} · {formatDate(s.date)}</div>
                    <WheelStatusRow hot={s.hotPressures as unknown as WheelValues} target={s.targetPressures as unknown as WheelValues} unit={s.pressureUnit} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDelete(s.id, e)}
                      disabled={deleting === s.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#ff453a]/15 text-[#8e8e93] hover:text-[#ff453a]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                    <svg className="w-4 h-4 text-[#3a3a3c] group-hover:text-[#8e8e93] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
