import { useState } from "react";
import { useListCars, useCreateCar, useUpdateCar, useDeleteCar, getListCarsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Car = {
  id: string;
  name: string;
  make: string;
  model: string;
  year: string;
  notes: string;
  weightUnit: string;
  frontWeight?: number | null;
  rearWeight?: number | null;
  totalWeight?: number | null;
};

const EMPTY_FORM = { name: "", make: "", model: "", year: "", notes: "", weightUnit: "kg", frontWeight: "", rearWeight: "" };

function CarForm({ initial, onSave, onCancel, saving }: {
  initial?: typeof EMPTY_FORM;
  onSave: (d: typeof EMPTY_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full bg-[#2c2c2e] text-[#f5f5f7] placeholder-[#8e8e93] rounded-lg px-3 py-2 text-sm border border-[#3a3a3c] focus:outline-none focus:border-[#ef3e36]";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Name *</label>
          <input className={inputCls} value={form.name} onChange={set("name")} placeholder="My Civic" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Year</label>
          <input className={inputCls} value={form.year} onChange={set("year")} placeholder="2023" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Make</label>
          <input className={inputCls} value={form.make} onChange={set("make")} placeholder="Honda" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Model</label>
          <input className={inputCls} value={form.model} onChange={set("model")} placeholder="Civic Type R" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Front Weight ({form.weightUnit})</label>
          <input className={inputCls} type="number" value={form.frontWeight} onChange={set("frontWeight")} placeholder="650" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] block mb-1">Rear Weight ({form.weightUnit})</label>
          <input className={inputCls} type="number" value={form.rearWeight} onChange={set("rearWeight")} placeholder="550" />
        </div>
      </div>
      <div>
        <label className="text-xs text-[#8e8e93] block mb-1">Notes</label>
        <textarea className={inputCls} rows={2} value={form.notes} onChange={set("notes")} placeholder="Notes..." />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-[#8e8e93] hover:text-[#f5f5f7] transition-colors">Cancel</button>
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

export default function CarsPage() {
  const { data: cars = [], isLoading } = useListCars();
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function invalidate() { queryClient.invalidateQueries({ queryKey: getListCarsQueryKey() }); }

  async function handleCreate(form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      await createCar.mutateAsync({ data: {
        name: form.name, make: form.make, model: form.model, year: form.year,
        notes: form.notes, weightUnit: form.weightUnit,
        frontWeight: form.frontWeight ? Number(form.frontWeight) : null,
        rearWeight: form.rearWeight ? Number(form.rearWeight) : null,
        totalWeight: null,
      }});
      invalidate(); setShowCreate(false); toast.success("Vehicle added");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: string, form: typeof EMPTY_FORM) {
    setSaving(true);
    try {
      await updateCar.mutateAsync({ id, data: {
        name: form.name, make: form.make, model: form.model, year: form.year,
        notes: form.notes, weightUnit: form.weightUnit,
        frontWeight: form.frontWeight ? Number(form.frontWeight) : null,
        rearWeight: form.rearWeight ? Number(form.rearWeight) : null,
      }});
      invalidate(); setEditId(null); toast.success("Vehicle updated");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    setDeleting(id);
    try {
      await deleteCar.mutateAsync({ id });
      invalidate(); toast.success("Vehicle deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f7] tracking-tight">Vehicles</h1>
          <p className="text-sm text-[#8e8e93] mt-0.5">{cars.length} registered</p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#ef3e36] text-white rounded-lg hover:bg-[#d63530] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Vehicle
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-[#1c1c1e] rounded-xl border border-[#ef3e36]/40 p-4 mb-4">
          <div className="text-sm font-semibold text-[#f5f5f7] mb-3">New Vehicle</div>
          <CarForm onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={saving} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#1c1c1e] rounded-xl animate-pulse" />)}
        </div>
      ) : cars.length === 0 && !showCreate ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-[#2c2c2e] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#8e8e93]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
          </div>
          <div className="text-[#8e8e93] text-sm">No vehicles yet</div>
        </div>
      ) : (
        <div className="space-y-2">
          {cars.map((c) => (
            <div key={c.id} className="bg-[#1c1c1e] rounded-xl border border-[#3a3a3c] overflow-hidden">
              {editId === c.id ? (
                <div className="p-4">
                  <CarForm
                    initial={{ name: c.name, make: c.make, model: c.model, year: c.year, notes: c.notes, weightUnit: c.weightUnit, frontWeight: c.frontWeight?.toString() ?? "", rearWeight: c.rearWeight?.toString() ?? "" }}
                    onSave={(f) => handleUpdate(c.id, f)}
                    onCancel={() => setEditId(null)}
                    saving={saving}
                  />
                </div>
              ) : (
                <div className="group flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#f5f5f7] truncate">{c.name}</div>
                    <div className="text-xs text-[#8e8e93] truncate">{[c.year, c.make, c.model].filter(Boolean).join(" ")}</div>
                    {(c.frontWeight || c.rearWeight) && (
                      <div className="text-xs text-[#8e8e93] mt-0.5">
                        {c.frontWeight}F / {c.rearWeight}R {c.weightUnit}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditId(c.id)} className="p-1.5 rounded-lg hover:bg-[#2c2c2e] text-[#8e8e93] hover:text-[#f5f5f7]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-1.5 rounded-lg hover:bg-[#ff453a]/15 text-[#8e8e93] hover:text-[#ff453a]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
