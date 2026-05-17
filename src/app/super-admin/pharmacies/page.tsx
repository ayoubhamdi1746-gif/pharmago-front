"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, ChevronUp, ChevronDown, ChevronRight, X, Building2, MapPin, CreditCard, Truck, Calendar, CheckCircle2, XCircle } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import Skeleton from "@/components/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

interface Pharmacy {
  id: string;
  pharmacy_name: string;
  city: string | null;
  plan: string;
  is_active: boolean;
  delivery_count_this_month: number;
  delivery_limit: number | null;
  total_delivery_earnings: number;
  price_tnd: number;
  expires_at: string;
  owner_email?: string;
  owner_name?: string;
}

type SortKey = "pharmacy_name" | "city" | "plan" | "delivery_count_this_month" | "total_delivery_earnings" | "expires_at";
type SortDir = "asc" | "desc";

const PLAN_COLORS: Record<string, string> = { STARTER: "#60A5FA", PRO: "#00C9A7", ENTERPRISE: "#C084FC" };

function SortableHeader({ label, sortKey, current, direction, onClick }: { label: string; sortKey: SortKey; current: SortKey; direction: SortDir; onClick: () => void }) {
  const active = current === sortKey;
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white transition-colors group">
      {label}
      <span className={`${active ? "text-[#00C9A7]" : "text-white/20 group-hover:text-white/40"} transition-colors`}>
        {active ? (direction === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronUp size={12} className="opacity-30" />}
      </span>
    </button>
  );
}

function SidePanel({ pharmacy, onClose }: { pharmacy: Pharmacy; onClose: () => void }) {
  const [activating, setActivating] = useState(false);
  const [newPlan, setNewPlan] = useState(pharmacy.plan);
  const planOptions = ["STARTER", "PRO", "ENTERPRISE"];

  const getToken = (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pharmago_token") ?? "";
  };

  const handleToggle = async () => {
    setActivating(true);
    try {
      const token = getToken();
      await fetch(`/api/admin/pharmacies/${pharmacy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !pharmacy.is_active }),
        credentials: "include",
      });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: pharmacy.is_active ? "Pharmacie désactivée" : "Pharmacie activée" } }));
      onClose();
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur" } }));
    } finally {
      setActivating(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 bottom-0 w-96 z-50 overflow-y-auto"
      style={{ background: "#050D1A", borderLeft: "1px solid rgba(0,201,167,0.15)" }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{pharmacy.pharmacy_name}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${PLAN_COLORS[pharmacy.plan] ?? "#00C9A7"}20`, color: PLAN_COLORS[pharmacy.plan] ?? "#00C9A7" }}>
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-xs text-white/30">Plan actuel</p>
              <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white border border-[#00D4AA]/20 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:border-[#00D4AA]">
                {planOptions.map((p) => <option key={p} value={p} style={{ background: "#050D1A" }}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] text-white/30 mb-1">Livraisons ce mois</p>
              <p className="text-xl font-bold text-white">{pharmacy.delivery_count_this_month}</p>
              {pharmacy.delivery_limit && <p className="text-[10px] text-white/30">/{pharmacy.delivery_limit}</p>}
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] text-white/30 mb-1">Revenus totaux</p>
              <p className="text-xl font-bold text-[#00C9A7]">{pharmacy.total_delivery_earnings.toFixed(0)}</p>
              <p className="text-[10px] text-white/30">TND</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: <MapPin size={14} />, label: "Ville", value: pharmacy.city || "—" },
              { icon: <CreditCard size={14} />, label: "Prix", value: `${pharmacy.price_tnd} TND` },
              { icon: <Calendar size={14} />, label: "Expire", value: new Date(pharmacy.expires_at).toLocaleDateString("fr-TN") },
              { icon: <Truck size={14} />, label: "Statut", value: pharmacy.is_active ? "Actif" : "Inactif" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 text-sm">
                <span style={{ color: "#00C9A7" }}>{row.icon}</span>
                <span className="text-white/40 w-16">{row.label}</span>
                <span className="text-white font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleToggle}
              disabled={activating}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                pharmacy.is_active
                  ? "bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/30 hover:bg-[#FF4D6D]/20"
                  : "bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/30 hover:bg-[#00C9A7]/20"
              }`}
            >
              {activating ? "..." : pharmacy.is_active ? <><XCircle size={14} /> Désactiver</> : <><CheckCircle2 size={14} /> Activer</>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PLANS = ["STARTER", "PRO", "ENTERPRISE"];

export default function SuperAdminPharmacies() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("pharmacy_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pharmago_token") ?? "";
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    fetch("/api/admin/pharmacies", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => { setPharmacies(json.data?.pharmacies ?? []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = pharmacies.filter((p) => {
      const nameCity = `${p.pharmacy_name} ${p.city ?? ""}`.toLowerCase();
      if (search && !nameCity.includes(search.toLowerCase())) return false;
      if (planFilter && p.plan !== planFilter) return false;
      if (cityFilter && p.city !== cityFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      let av: string | number = a[sortKey] as string | number ?? "";
      let bv: string | number = b[sortKey] as string | number ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [pharmacies, search, planFilter, cityFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleExportCSV = () => {
    const headers = ["Nom", "Ville", "Plan", "Livraisons", "Revenus", "Expiration", "Statut"];
    const rows = filtered.map((p) => [p.pharmacy_name, p.city || "", p.plan, p.delivery_count_this_month, p.total_delivery_earnings, p.expires_at, p.is_active ? "Actif" : "Inactif"]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pharmacies.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Pharmacies</h1>
            <p className="text-sm text-white/40 mt-1">{filtered.length} pharmacies</p>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#C084FC] bg-[#C084FC]/10 border border-[#C084FC]/20 hover:bg-[#C084FC]/20 transition-all active:scale-[0.97]">
            <Download size={14} />Export CSV
          </button>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher une pharmacie..." className="w-full pl-9 pr-4 py-2.5 border border-[#00D4AA]/20 bg-[#0A1628] rounded-xl text-sm text-white focus:outline-none focus:border-[#00D4AA] placeholder-gray-500" />
          </div>
          <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-[#00D4AA]/20 bg-[#0A1628] text-white rounded-xl text-sm focus:outline-none focus:border-[#00D4AA]">
            <option value="">Tous les plans</option>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-[#00D4AA]/20 bg-[#0A1628] text-white rounded-xl text-sm focus:outline-none focus:border-[#00D4AA]">
            <option value="">Toutes les villes</option>
            {[...new Set(pharmacies.map((p) => p.city).filter(Boolean) as string[])].sort().map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="px-4 py-2.5 border border-[#00D4AA]/20 bg-[#0A1628] text-white rounded-xl text-sm focus:outline-none focus:border-[#00D4AA]">
            <option value={10}>10/page</option>
            <option value={25}>25/page</option>
            <option value={50}>50/page</option>
          </select>
        </motion.div>

        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/40 bg-[#0D1E32]/80 border-b border-[#00D4AA]/10">
                    <th className="p-4"><SortableHeader label="Nom" sortKey="pharmacy_name" current={sortKey} direction={sortDir} onClick={() => handleSort("pharmacy_name")} /></th>
                    <th className="p-4"><SortableHeader label="Ville" sortKey="city" current={sortKey} direction={sortDir} onClick={() => handleSort("city")} /></th>
                    <th className="p-4"><SortableHeader label="Plan" sortKey="plan" current={sortKey} direction={sortDir} onClick={() => handleSort("plan")} /></th>
                    <th className="p-4"><SortableHeader label="Livraisons" sortKey="delivery_count_this_month" current={sortKey} direction={sortDir} onClick={() => handleSort("delivery_count_this_month")} /></th>
                    <th className="p-4"><SortableHeader label="Revenus" sortKey="total_delivery_earnings" current={sortKey} direction={sortDir} onClick={() => handleSort("total_delivery_earnings")} /></th>
                    <th className="p-4"><SortableHeader label="Expiration" sortKey="expires_at" current={sortKey} direction={sortDir} onClick={() => handleSort("expires_at")} /></th>
                    <th className="p-4">Statut</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id} onClick={() => setSelected(p)}
                      className="border-b border-[#00D4AA]/5 hover:bg-[#00D4AA]/5 cursor-pointer transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${PLAN_COLORS[p.plan] ?? "#00C9A7"}15`, color: PLAN_COLORS[p.plan] ?? "#00C9A7" }}>
                            <Building2 size={14} />
                          </div>
                          <span className="font-medium text-white">{p.pharmacy_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/50">{p.city || "—"}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ background: `${PLAN_COLORS[p.plan] ?? "#00C9A7"}15`, color: PLAN_COLORS[p.plan] ?? "#00C9A7" }}>
                          {p.plan}
                        </span>
                      </td>
                      <td className="p-4 text-white/70">{p.delivery_count_this_month}{p.delivery_limit ? `/${p.delivery_limit}` : ""}</td>
                      <td className="p-4 text-[#00C9A7] font-semibold">{p.total_delivery_earnings.toFixed(0)} TND</td>
                      <td className="p-4 text-white/50 text-xs">{new Date(p.expires_at).toLocaleDateString("fr-TN")}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full ${p.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {p.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="p-4 text-white/20"><ChevronRight size={14} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 flex items-center justify-between border-t border-[#00D4AA]/10">
              <span className="text-xs text-white/30">
                Affichage {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} sur {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20">
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                        page === pg ? "bg-[#00C9A7] text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20">
                  ›
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {selected && <SidePanel pharmacy={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      )}
    </RoleGuard>
  );
}