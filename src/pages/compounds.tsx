import { useState } from "react";
import { useListCompounds, useCreateCompound, useUpdateCompound, useDeleteCompound, getListCompoundsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { WheelValues } from "@/lib/utils";

interface PresetCompound {
  brand: string;
  name: string;
  targetPressures: WheelValues;
  pressureUnit: string;
}

const DEFAULT_COMPOUNDS: PresetCompound[] = [
  { brand: "Bridgestone", name: "Potenza RE-71RS",       targetPressures: { fl: 34, fr: 34, rl: 34, rr: 34 }, pressureUnit: "psi" },
  { brand: "Continental", name: "ExtremeContact Force",   targetPressures: { fl: 34, fr: 34, rl: 34, rr: 34 }, pressureUnit: "psi" },
  { brand: "Hankook",     name: "Ventus RS4",             targetPressures: { fl: 36, fr: 36, rl: 36, rr: 36 }, pressureUnit: "psi" },
  { brand: "Hankook",     name: "Z221",                   targetPressures: { fl: 32, fr: 32, rl: 32, rr: 32 }, pressureUnit: "psi" },
  { brand: "Michelin",    name: "Pilot Sport Cup 2",      targetPressures: { fl: 36, fr: 36, rl: 36, rr: 36 }, pressureUnit: "psi" },
  { brand: "Michelin",    name: "Pilot Sport Cup 2 R",    targetPressures: { fl: 36, fr: 36, rl: 36, rr: 36 }, pressureUnit: "psi" },
  { brand: "Nankang",     name: "AR-1",                   targetPressures: { fl: 30, fr: 30, rl: 30, rr: 30 }, pressureUnit: "psi" },
  { brand: "Nankang",     name: "CR-S",                   targetPressures: { fl: 28, fr: 28, rl: 28, rr: 28 }, pressureUnit: "psi" },
  { brand: "Pirelli",     name: "P Zero Trofeo R",        targetPressures: { fl: 34, fr: 34, rl: 34, rr: 34 }, pressureUnit: "psi" },
  { brand: "Toyo",        name: "Proxes R888R",           targetPressures: { fl: 34, fr: 34, rl: 34, rr: 34 }, pressureUnit: "psi" },
  { brand: "Yokohama",    name: "Advan A052",             targetPressures: { fl: 34, fr: 34, rl: 34, rr: 34 }, pressureUnit: "psi" },
  { brand: "Yokohama",    name: "Advan A050",             targetPressures: { fl: 28, fr: 28, rl: 28, rr: 28 }, pressureUnit: "psi" },
];

const EMPTY_FORM = { brand: "", name: "", pressureUnit: "psi", fl: "", fr: "", rl: "", rr: "" };

function CompoundForm({ initial, onSave, onCancel, saving }: {
  initial?: typeof EMPTY_FORM;
  onSave: (d: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full bg-[#2c2c2e] text-[#f5f5f7] placeholder-[#8e8e93] rounded-lg px-3 py-2 text-sm border border-[#3a3a3c] focus:outline-none focus:border-[#ef3e36]";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Brand *</label>
          <input className={inputCls} value={form.brand} onChange={set("brand")} placeholder="Pirelli" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Name *</label>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="P Zero Trofeo R" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Unit</label>
          <select className={inputCls} value={form.pressureUnit} onChange={set("pressureUnit")}>
            <option value="psi">psi</option>
            <option value="bar">bar</option>
            <option value="kPa">kPa</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-[#8e8e93] block mb-1">Target Pressures ({form.pressureUnit})</label>
        <div className="grid grid-cols-4 gap-2">
          {(["fl", "fr", "rl", "rr"] as const).map((w) => (
            <div key={w}>
              <label className="text-[10px] text-[#8e8e93] block mb-0.5 uppercase">{w}</label>
              <input className={inputCls + " text-center font-mono"} type="number" step="0.1" value={form[w]} onChange={set(w)} placeholder="32" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-[#8e8e93] hover:text-[#f5f5f7] transition-colors">Cancel</button>
        <button
          onClick={() => {
            if (!form.brand.trim() || !form.name.trim()) { toast.error("Brand and name required"); return; }
            onSave(form);
          }}
          disabled={saving}
          className="px-4 py-1.5 text-sm font-medium bg-[#ef3e36] text-white rounded-lg hover:bg-[#d63530] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function toWheelValues(form: typeof EMPTY_FORM): WheelValues {
  return { fl: Number(form.fl) || 0, fr: Number(form.fr) || 0, rl: Number(form.rl) || 0, rr: Number(form.rr) || 0 };
}

export default function CompoundsPage() {
  const { data: compounds = [], isLoading } = useListCompounds();
  const createCompound = useCreateCompound();
  const updateCompound = useUpdateCompound();
  const deleteCompound = useDeleteCompound();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  function invalidate() { queryClient.invalidateQueries({ queryKey: getListCompoundsQueryKey() }); }

  async function handleCreate(form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      await createCompound.mutateAsync({ data: {
        brand: form.brand, name: form.name, pressureUnit: form.pressureUnit,
        targetPressures: toWheelValues(form),
      }});
      invalidate(); setShowCreate(false); toast.success("Compound added");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: string, form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      await updateCompound.mutateAsync({ id, data: {
        brand: form.brand, name: form.name, pressureUnit: form.pressureUnit,
        targetPressures: toWheelValues(form),
      }});
      invalidate(); setEditId(null); toast.success("Compound updated");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this compound?")) return;
    setDeleting(id);
    try {
      await deleteCompound.mutateAsync({ id });
      invalidate(); toast.success("Compound deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try {
      await Promise.all(
        DEFAULT_COMPOUNDS.map((c) =>
          createCompound.mutateAsync({ data: {
            brand: c.brand, name: c.name, pressureUnit: c.pressureUnit,
            targetPressures: c.targetPressures,
          }})
        )
      );
      invalidate();
      toast.success(`Loaded ${DEFAULT_COMPOUNDS.length} common compounds`);
    } catch { toast.error("Failed to load compounds"); }
    finally { setSeeding(false); }
  }

  // Group compounds by brand for display
  const grouped = compounds.reduce<Record<string, typeof compounds>>((acc, c) => {
    const b = c.brand || "Other";
    acc[b] = [...(acc[b] ?? []), c];
    return acc;
  }, {});
  const brands = Object.keys(grouped).sort();

  const isEmpty = !isLoading && compounds.length === 0;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">Compounds</h1>
          <p className="text-sm text-[#8e8e93] mt-0.5">
            {compounds.length > 0 ? `${compounds.length} tyre specification${compounds.length !== 1 ? "s" : ""}` : "Tyre specifications"}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ef3e36] text-white rounded-lg hover:bg-[#d63530] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Compound
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-[#1c1c1e] rounded-xl border border-[#ef3e36]/40 p-4 mb-4">
          <div className="text-sm font-semibold text-[#f5f5f7] mb-3">New Compound</div>
          <CompoundForm onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={saving} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-[#1c1c1e] rounded-xl animate-pulse" />)}</div>
      ) : isEmpty && !showCreate ? (
        /* ── Empty state with seed prompt ── */
        <div className="space-y-4">
          <div className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#ef3e36]/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-[#ef3e36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-[#f5f5f7] mb-0.5">Load common compounds</div>
                <div className="text-xs text-[#8e8e93]">
                  Start with {DEFAULT_COMPOUNDS.length} popular track-day tyre compounds, pre-filled with typical target pressures. You can edit or delete any of them.
                </div>
              </div>
            </div>

            {/* Preview list */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {DEFAULT_COMPOUNDS.map((c) => (
                <div key={`${c.brand}-${c.name}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#2c2c2e]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef3e36] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-[#8e8e93]">{c.brand} </span>
                    <span className="text-xs text-[#f5f5f7] font-medium">{c.name}</span>
                  </div>
                  <span className="ml-auto text-[10px] font-mono text-[#8e8e93] shrink-0">{c.targetPressures.fl} {c.pressureUnit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#ef3e36] text-white rounded-lg hover:bg-[#d63530] disabled:opacity-60 transition-colors"
            >
              {seeding ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                  Load {DEFAULT_COMPOUNDS.length} Common Compounds
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ── Grouped compound list ── */
        <div className="space-y-5">
          {brands.map((brand) => (
            <div key={brand}>
              <div className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-widest mb-2 px-1">{brand}</div>
              <div className="space-y-1.5">
                {grouped[brand].map((c) => {
                  const tp = c.targetPressures as unknown as WheelValues;
                  return (
                    <div key={c.id} className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] overflow-hidden">
                      {editId === c.id ? (
                        <div className="p-4">
                          <CompoundForm
                            initial={{ brand: c.brand, name: c.name, pressureUnit: c.pressureUnit, fl: tp.fl.toString(), fr: tp.fr.toString(), rl: tp.rl.toString(), rr: tp.rr.toString() }}
                            onSave={(f) => handleUpdate(c.id, f)}
                            onCancel={() => setEditId(null)}
                            saving={saving}
                          />
                        </div>
                      ) : (
                        <div className="group flex items-center gap-3 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#f5f5f7] truncate">{c.name}</div>
                            <div className="flex items-center gap-3 mt-1">
                              {(["fl", "fr", "rl", "rr"] as const).map((w) => (
                                <div key={w} className="text-[11px] font-mono">
                                  <span className="text-[#8e8e93]">{w.toUpperCase()} </span>
                                  <span className="text-[#f5f5f7] font-medium">{tp[w]}</span>
                                </div>
                              ))}
                              <span className="text-[11px] text-[#8e8e93]">{c.pressureUnit}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => setEditId(c.id)} className="p-1.5 rounded-lg hover:bg-[#2c2c2e] text-[#8e8e93] hover:text-[#f5f5f7]">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-1.5 rounded-lg hover:bg-[#ff453a]/15 text-[#8e8e93] hover:text-[#ff453a]">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
