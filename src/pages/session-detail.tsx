import { useRoute, useLocation } from "wouter";
import { useGetSession, getGetSessionQueryKey } from "@workspace/api-client-react";
import { formatDate, getDeltaStatus, getDeltaColorClass, getDeltaBgClass, type WheelValues } from "@/lib/utils";

const WHEEL_KEYS: Array<keyof WheelValues> = ["fl", "fr", "rl", "rr"];
const WHEEL_LABELS: Record<keyof WheelValues, string> = { fl: "Front Left", fr: "Front Right", rl: "Rear Left", rr: "Rear Right" };

function WheelCard({ label, cold, target, hot, unit }: { label: string; cold: number; target: number; hot: number; unit: string }) {
  const delta = hot - target;
  const increase = hot - cold;
  const status = getDeltaStatus(delta);

  return (
    <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-4">
      <div className="text-xs font-bold text-[#8e8e93] uppercase tracking-widest mb-3">{label}</div>
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8e8e93]">Cold</span>
          <span className="text-sm font-mono text-[#f5f5f7]">{cold.toFixed(1)} <span className="text-[#8e8e93] text-xs">{unit}</span></span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8e8e93]">Target</span>
          <span className="text-sm font-mono text-[#f5f5f7]">{target.toFixed(1)} <span className="text-[#8e8e93] text-xs">{unit}</span></span>
        </div>
        <div className="h-px bg-[#3a3a3c]" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8e8e93]">Hot</span>
          <span className={`text-base font-bold font-mono ${getDeltaColorClass(status)}`}>{hot.toFixed(1)} <span className="text-xs font-normal">{unit}</span></span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8e8e93]">Delta vs target</span>
          <span className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${getDeltaBgClass(status)}`}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8e8e93]">Rise</span>
          <span className="text-xs font-mono text-[#8e8e93]">+{increase.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export default function SessionDetailPage() {
  const [, params] = useRoute("/sessions/:id");
  const [, navigate] = useLocation();
  const id = params?.id ?? "";

  const { data: session, isLoading } = useGetSession(id, { query: { enabled: !!id, queryKey: getGetSessionQueryKey(id) } });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-[#1c1c1e] rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-[#1c1c1e] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-[#8e8e93]">Session not found.</div>
    );
  }

  const cold = session.coldPressures as unknown as WheelValues;
  const target = session.targetPressures as unknown as WheelValues;
  const hot = session.hotPressures as unknown as WheelValues;

  return (
    <div className="p-6 max-w-3xl">
      <button
        onClick={() => navigate("/sessions")}
        className="flex items-center gap-1.5 text-sm text-[#8e8e93] hover:text-[#f5f5f7] mb-4 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Sessions
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">{session.trackName}</h1>
        <div className="flex items-center gap-3 mt-1.5 text-sm text-[#8e8e93]">
          <span>{session.carName}</span>
          <span className="w-1 h-1 rounded-full bg-[#3a3a3c]" />
          <span>{formatDate(session.date)}</span>
          <span className="w-1 h-1 rounded-full bg-[#3a3a3c]" />
          <span>{session.ambientTemp}°{session.tempUnit}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {WHEEL_KEYS.map((w) => (
          <WheelCard
            key={w}
            label={WHEEL_LABELS[w]}
            cold={cold[w]}
            target={target[w]}
            hot={hot[w]}
            unit={session.pressureUnit}
          />
        ))}
      </div>

      {session.notes && (
        <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-4 mb-4">
          <div className="text-xs font-bold text-[#8e8e93] uppercase tracking-widest mb-2">Notes</div>
          <p className="text-sm text-[#f5f5f7] whitespace-pre-wrap">{session.notes}</p>
        </div>
      )}

      {(session.camber || session.toe) && (
        <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-4">
          <div className="text-xs font-bold text-[#8e8e93] uppercase tracking-widest mb-3">Alignment</div>
          {session.camber && (
            <div className="mb-3">
              <div className="text-xs text-[#8e8e93] mb-2">Camber (°)</div>
              <div className="grid grid-cols-4 gap-2">
                {WHEEL_KEYS.map((w) => (
                  <div key={w} className="text-center">
                    <div className="text-[10px] text-[#8e8e93] mb-0.5">{w.toUpperCase()}</div>
                    <div className="text-sm font-mono text-[#f5f5f7]">{(session.camber as unknown as WheelValues)[w].toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {session.toe && (
            <div>
              <div className="text-xs text-[#8e8e93] mb-2">Toe ({session.toeUnit ?? "deg"})</div>
              <div className="grid grid-cols-4 gap-2">
                {WHEEL_KEYS.map((w) => (
                  <div key={w} className="text-center">
                    <div className="text-[10px] text-[#8e8e93] mb-0.5">{w.toUpperCase()}</div>
                    <div className="text-sm font-mono text-[#f5f5f7]">{(session.toe as unknown as WheelValues)[w].toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
