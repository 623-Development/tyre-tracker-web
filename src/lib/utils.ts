import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export type WheelKey = "fl" | "fr" | "rl" | "rr";
export const WHEEL_LABELS: Record<WheelKey, string> = {
  fl: "FL", fr: "FR", rl: "RL", rr: "RR",
};

export interface WheelValues {
  fl: number;
  fr: number;
  rl: number;
  rr: number;
}

export const PRESSURE_TOLERANCE = 0.5;

export type DeltaStatus = "on" | "over" | "under";

export function getDeltaStatus(delta: number): DeltaStatus {
  if (Math.abs(delta) <= PRESSURE_TOLERANCE) return "on";
  return delta > 0 ? "over" : "under";
}

export function getDeltaColorClass(status: DeltaStatus): string {
  if (status === "on") return "text-[#30d158]";
  if (status === "over") return "text-[#ff453a]";
  return "text-[#0a84ff]";
}

export function getDeltaBgClass(status: DeltaStatus): string {
  if (status === "on") return "bg-[#30d158]/15 text-[#30d158]";
  if (status === "over") return "bg-[#ff453a]/15 text-[#ff453a]";
  return "bg-[#0a84ff]/15 text-[#0a84ff]";
}
