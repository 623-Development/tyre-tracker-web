import { useState } from "react";
import { useListSetups, useCreateSetup, useUpdateSetup, useDeleteSetup, getListSetupsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDate, type WheelValues } from "@/lib/utils";

const EMPTY_FORM = {
  name: "", carName: "", carId: "", date: new Date().toISOString().split("T")[0],
  toeUnit: "deg", notes: "",
  camberFl: "", camberFr: "", camberRl: "", camberRr: "",
  toeFl: "", toeFr: "", toeRl: "", toeRr: "",
};

function WheelInput({ label, fl, fr, rl, rr, onChange, unit }: {
  label: string;
  fl: string; fr: string; rl: string; rr: string;
  onChange: (w: string, v: string) => void;
  unit?: string;
}) {
  const inputCls = "w-full bg-[#2c2c2e] text-[#f5f5f7] placeholder-[#8e8e93] rounded-lg px-2 py-1.5 text-sm border border-[#3a3a3c] focus:outline-none focus:border-[#ef3e36] text-center font-mono";
  return (
    <div>
      <label className="text-xs text-[#8e8e93] block mb-1">{label} {unit ? `(${unit})` : ""}</label>
      <div className="grid grid-cols-4 gap-2">
        {[["fl", fl], ["fr", fr], ["rl", rl], ["rr", rr]].map(([w, v]) => (
          <div key={w}>
            <div className="text-[10px] text-[#8e8e93] text-center mb-0.5 uppercase">{w}</div>
            <input className={inputCls} type="number" step="0.01" value={v as string} onChange={(e) => onChange(w as string, e.target.value)} placeholder="0.00" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupForm({ initial, onSave, onCancel, saving }: {
  initial?: typeof EMPTY_FORM;
  onSave: (d: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setWheel = (prefix: string) => (w: string, v: string) =>
    setForm((f) => ({ ...f, [`${prefix}${w.charAt(0).toUpperCase()}${w.slice(1)}`]: v } as typeof EMPTY_FORM));

  const inputCls = "w-full bg-[#2c2c2e] text-[#f5f5f7] placeholder-[#8e8e93] rounded-lg px-3 py-2 text-sm border border-[#3a3a3c] focus:outline-none focus:border-[#ef3e36]";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Setup Name *</label>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Race Setup A" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Date</label>
          <input className={inputCls} type="date" value={form.date} onChange={set("date")} />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Vehicle</label>
          <input className={inputCls} value={form.carName} onChange={set("carName")} placeholder="Honda Civic Type R" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Toe Unit</label>
          <select className={inputCls} value={form.toeUnit} onChange={set("toeUnit")}>
            <option value="deg">deg</option>
            <option value="mm">mm</option>
            <option value="in">in</option>
          </select>
        </div>
      </div>
      <WheelInput label="Camber" unit="°" fl={form.camberFl} fr={form.camberFr} rl={form.camberRl} rr={form.camberRr} onChange={setWheel("camber")} />
      <WheelInput label="Toe" unit={form.toeUnit} fl={form.toeFl} fr={form.toeFr} rl={form.toeRl} rr={form.toeRr} onChange={setWheel("toe")} />
      <div>
        <label className="text-xs text-[#8e8e93] block mb-1">Notes</label>
        <textarea className={inputCls} rows={2} value={form.notes} onChange={set("notes")} placeholder="Notes..." />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-[#8e8e93] hover:text-[#f5f5f7]">Cancel</button>
        <button
          onClick={() => { if (!form.name.trim()) { toast.error("Name required"); return; } onSave(form); }}
          disabled={saving}
          className="px-4 py-1.5 text-sm font-medium bg-[#ef3e36] text-white rounded-lg hover:bg-[#d63530] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function toWheels(form: typeof EMPTY_FORM, prefix: string): WheelValues {
  const p = prefix;
  const f = form as Record<string, string>;
  return {
    fl: Number(f[`${p}Fl`]) || 0,
    fr: Number(f[`${p}Fr`]) || 0,
    rl: Number(f[`${p}Rl`]) || 0,
    rr: Number(f[`${p}Rr`]) || 0,
  };
}

export default function SetupsPage() {
  const { data: setups = [], isLoading } = useListSetups();
  const createSetup = useCreateSetup();
  const updateSetup = useUpdateSetup();
  const deleteSetup = useDeleteSetup();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function invalidate() { queryClient.invalidateQueries({ queryKey: getListSetupsQueryKey() }); }

  async function handleCreate(form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      await createSetup.mutateAsync({ data: {
        name: form.name, carId: form.carId || null, carName: form.carName || "",
        date: form.date, toeUnit: form.toeUnit, notes: form.notes,
        camber: toWheels(form, "camber"), toe: toWheels(form, "toe"),
      }});
      invalidate(); setShowCreate(false); toast.success("Setup saved");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: string, form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      await updateSetup.mutateAsync({ id, data: {
        name: form.name, carId: form.carId || null, carName: form.carName || "",
        date: form.date, toeUnit: form.toeUnit, notes: form.notes,
        camber: toWheels(form, "camber"), toe: toWheels(form, "toe"),
      }});
      invalidate(); setEditId(null); toast.success("Setup updated");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this setup?")) return;
    setDeleting(id);
    try {
      await deleteSetup.mutateAsync({ id });
      invalidate(); toast.success("Setup deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">Setups</h1>
          <p className="text-sm text-[#8e8e93] mt-0.5">{setups.length} alignment configurations</p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ef3e36] text-white rounded-lg hover:bg-[#d63530] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Setup
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-[#1c1c1e] rounded-xl border border-[#ef3e36]/40 p-4 mb-4">
          <div className="text-sm font-semibold text-[#f5f5f7] mb-3">New Setup</div>
          <SetupForm onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={saving} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#1c1c1e] rounded-xl animate-pulse" />)}</div>
      ) : setups.length === 0 && !showCreate ? (
        <div className="text-center py-16">
          <div className="text-[#8e8e93] text-sm">No setups yet</div>
        </div>
      ) : (
        <div className="space-y-2">
          {setups.map((s) => {
            const camber = s.camber as unknown as WheelValues;
            const toe = s.toe as unknown as WheelValues;
            return (
              <div key={s.id} className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] overflow-hidden">
                {editId === s.id ? (
                  <div className="p-4">
                    <SetupForm
                      initial={{
                        name: s.name, carName: s.carName, carId: s.carId ?? "",
                        date: s.date, toeUnit: s.toeUnit, notes: s.notes,
                        camberFl: camber.fl.toString(), camberFr: camber.fr.toString(), camberRl: camber.rl.toString(), camberRr: camber.rr.toString(),
                        toeFl: toe.fl.toString(), toeFr: toe.fr.toString(), toeRl: toe.rl.toString(), toeRr: toe.rr.toString(),
                      }}
                      onSave={(f) => handleUpdate(s.id, f)}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                    />
                  </div>
                ) : (
                  <div className="group flex items-center gap-4 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#f5f5f7] truncate">{s.name}</div>
                      <div className="text-xs text-[#8e8e93]">{s.carName} · {formatDate(s.date)}</div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-[#8e8e93]">Camber: {camber.fl.toFixed(1)}° / {camber.fr.toFixed(1)}°</span>
                        <span className="text-[10px] text-[#8e8e93]">Toe: {toe.fl.toFixed(2)} / {toe.fr.toFixed(2)} {s.toeUnit}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditId(s.id)} className="p-1.5 rounded-lg hover:bg-[#2c2c2e] text-[#8e8e93] hover:text-[#f5f5f7]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg hover:bg-[#ff453a]/15 text-[#8e8e93] hover:text-[#ff453a]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
