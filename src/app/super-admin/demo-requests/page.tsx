"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, CheckCircle2, X, Clock, MapPin, Building2, User, ChevronDown } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

interface DemoRequestRow {
  id: string;
  name: string;
  pharmacy: string;
  city: string;
  phone: string;
  message: string;
  is_processed: boolean;
  created_at: string | null;
}

interface DemoRequestsData {
  requests: DemoRequestRow[];
  total: number;
}

type Status = "new" | "processed";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

function DemoCard({ req, onSelect }: { req: DemoRequestRow; onSelect: (r: DemoRequestRow) => void }) {
  const isNew = !req.is_processed && req.created_at && (Date.now() - new Date(req.created_at).getTime()) < 86400000;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#0A1628] border border-[#00D4AA]/20 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-[#00D4AA]/50 hover:shadow-[0_4px_20px_rgba(0,212,170,0.15)] group"
      onClick={() => onSelect(req)}
    >
      {isNew && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" />}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,201,167,0.1)" }}>
          <span className="text-sm font-semibold text-[#00C9A7]">{(req.name || "?").charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{req.name}</p>
            {isNew && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-pulse shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#00D4AA]">
            <Building2 size={10} />
            <span className="truncate">{req.pharmacy}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/30 mt-0.5">
            <MapPin size={10} />
            <span>{req.city || "—"}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-white/30">{formatRelative(req.created_at)}</span>
        <div className="flex gap-1">
          <a href={`tel:${req.phone}`} onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
            <Phone size={11} />
          </a>
          <a href={`mailto:?subject=Démo PharmaGo&body=Bonjour ${req.name},%0A%0A`} onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#60A5FA]/10 text-[#60A5FA] hover:bg-[#60A5FA]/20 transition-colors">
            <Mail size={11} />
          </a>
        </div>
      </div>
      {req.message && (
        <p className="text-[10px] text-white/30 mt-2 italic line-clamp-2">"{req.message}"</p>
      )}
    </motion.div>
  );
}

function RequestDetailModal({ req, onClose }: { req: DemoRequestRow; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const handleProcess = async (status: Status) => {
    setProcessing(true);
    try {
      await api.patch(`/public/demo-requests/${req.id}/process`);
      queryClient.invalidateQueries({ queryKey: ["demo-requests"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Demande mise à jour" } }));
      onClose();
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur lors de la mise à jour" } }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#050D1A", border: "1px solid rgba(0,201,167,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "rgba(0,201,167,0.15)", color: "#00C9A7" }}>
              {(req.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-semibold">{req.name}</h2>
              <p className="text-xs text-white/40">{req.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Building2 size={14} />, label: "Pharmacie", value: req.pharmacy },
              { icon: <MapPin size={14} />, label: "Ville", value: req.city || "—" },
              { icon: <Phone size={14} />, label: "Téléphone", value: req.phone },
              { icon: <Clock size={14} />, label: "Reçue le", value: formatDate(req.created_at) },
            ].map((field) => (
              <div key={field.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5 text-[#00C9A7] mb-1">
                  {field.icon}
                  <span className="text-[10px] font-medium">{field.label}</span>
                </div>
                <p className="text-sm text-white font-medium">{field.value}</p>
              </div>
            ))}
          </div>

          {req.message && (
            <div className="p-4 rounded-xl" style={{ background: "rgba(0,201,167,0.05)", border: "1px solid rgba(0,201,167,0.1)" }}>
              <p className="text-[10px] text-[#00C9A7] font-medium mb-2">Message</p>
              <p className="text-sm text-white/70 italic">"{req.message}"</p>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <div className="flex gap-2">
              <a href={`tel:${req.phone}`}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                <Phone size={14} />Appeler
              </a>
              <a href={`mailto:contact@pharmago.tn?subject=Démo PharmaGo - ${req.pharmacy}`}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20 hover:bg-[#60A5FA]/20 transition-all flex items-center justify-center gap-2">
                <Mail size={14} />Email
              </a>
            </div>
            {!req.is_processed ? (
              <button onClick={() => handleProcess("processed")}
                disabled={processing}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-[#00C9A7] text-white hover:bg-[#059669] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                {processing ? "..." : <><CheckCircle2 size={14} />Marquer comme traité</>}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={14} /> Demande traitée
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const COLUMNS: { id: Status; label: string; color: string; bg: string }[] = [
  { id: "new", label: "Nouveau", color: "#FF4D6D", bg: "rgba(255,77,109,0.08)" },
  { id: "processed", label: "Traité", color: "#00C9A7", bg: "rgba(0,201,167,0.08)" },
];

export default function SuperAdminDemoRequests() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<DemoRequestRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["demo-requests"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DemoRequestsData>>("/public/demo-requests");
      return res.data.data;
    },
  });

  const handleProcess = async (req: DemoRequestRow) => {
    try {
      await api.patch(`/public/demo-requests/${req.id}/process`);
      queryClient.invalidateQueries({ queryKey: ["demo-requests"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Marqué comme traité" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur" } }));
    }
  };

  const requests = data?.requests ?? [];
  const newReqs = requests.filter((r) => !r.is_processed);
  const processedReqs = requests.filter((r) => r.is_processed);

  const columns = [
    { ...COLUMNS[0], items: newReqs },
    { ...COLUMNS[1], items: processedReqs },
  ];

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Demandes de démo</h1>
            <p className="text-sm text-white/40 mt-1">{data?.total ?? 0} demandes · {newReqs.length} nouvelles</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-10 rounded-xl animate-pulse" style={{ background: "rgba(10,22,40,0.6)" }} />
                {[1, 2].map((j) => <div key={j} className="h-32 rounded-xl animate-pulse" style={{ background: "rgba(10,22,40,0.4)" }} />)}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {columns.map((col) => (
              <div key={col.id}>
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-semibold text-white">{col.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${col.color}15`, color: col.color }}>
                      {col.items.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {col.items.map((req) => (
                      <DemoCard key={req.id} req={req} onSelect={setSelected} />
                    ))}
                  </AnimatePresence>
                  {col.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: `${col.color}10` }}>
                        <CheckCircle2 size={18} className="text-white/10" />
                      </div>
                      <p className="text-xs text-white/20">{col.id === "new" ? "Aucune nouvelle demande" : col.id === "in_progress" ? "Aucune en cours" : "Aucune traitée"}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>{selected && <RequestDetailModal req={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </RoleGuard>
  );
}