"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Search, ChevronDown, ChevronRight, X, MoreHorizontal, User, Shield, Truck, Pill, Stethoscope, CheckSquare, Square, Mail, Ban, Edit3 } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

interface UserRow {
  id: string;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string | null;
  full_name: string | null;
}

interface UsersData {
  users: UserRow[];
  total: number;
}

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  super_admin: { icon: <Shield size={14} />, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  admin: { icon: <Shield size={14} />, color: "#A855F7", bg: "rgba(168,85,247,0.1)" },
  pharmacist: { icon: <Pill size={14} />, color: "#00C9A7", bg: "rgba(0,201,167,0.1)" },
  patient: { icon: <User size={14} />, color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  driver: { icon: <Truck size={14} />, color: "#FB923C", bg: "rgba(251,146,60,0.1)" },
  doctor: { icon: <Stethoscope size={14} />, color: "#22D3EE", bg: "rgba(34,211,238,0.1)" },
};

const VALID_ROLES = Object.keys(ROLE_CONFIG).filter((r) => r !== "super_admin");

function exportUsersCSV(users: UserRow[]) {
  const headers = ["Nom d'utilisateur", "Email", "Nom complet", "Rôle", "Actif", "Date création"];
  const rows = users.map((u) => [u.username, u.email ?? "", u.full_name ?? "", u.role, u.is_active ? "Oui" : "Non", u.created_at ? new Date(u.created_at).toLocaleDateString("fr-TN") : "N/A"]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "utilisateurs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function UserSidePanel({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [changingRole, setChangingRole] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleRoleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/admin/super/users/${user.id}/role`, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ["super-users"] });
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", message: "Rôle mis à jour" } }));
      onClose();
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", message: "Erreur lors du changement" } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 bottom-0 w-80 z-50 overflow-y-auto" style={{ background: "#050D1A", borderLeft: "1px solid rgba(0,201,167,0.15)" }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Profil utilisateur</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-3" style={{ background: `${ROLE_CONFIG[user.role]?.color ?? "#00C9A7"}20`, color: ROLE_CONFIG[user.role]?.color ?? "#00C9A7" }}>
            {(user.full_name ?? user.username).charAt(0).toUpperCase()}
          </div>
          <h3 className="text-white font-semibold">{user.full_name || user.username}</h3>
          <p className="text-white/40 text-xs">{user.username}</p>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/30 mb-2">Email</p>
            <div className="flex items-center gap-2 text-sm text-white">
              <Mail size={12} className="text-white/30" /> {user.email || "—"}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/30 mb-2">Statut</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-sm font-medium" style={{ color: user.is_active ? "#34D399" : "#F87171" }}>
                {user.is_active ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/30 mb-2">Date d&apos;inscription</p>
            <p className="text-sm text-white/70">{user.created_at ? new Date(user.created_at).toLocaleDateString("fr-TN", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
          </div>
          {!changingRole ? (
            <button onClick={() => setChangingRole(true)} className="w-full py-3 rounded-xl text-sm font-semibold bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20 hover:bg-[#00C9A7]/20 transition-all flex items-center justify-center gap-2">
              <Edit3 size={14} />Changer le rôle
            </button>
          ) : (
            <div className="space-y-3">
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#00D4AA]/20 bg-[#0A1628] text-white text-sm focus:outline-none focus:border-[#00D4AA]">
                {VALID_ROLES.map((r) => <option key={r} value={r} style={{ background: "#050D1A" }}>{r}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setChangingRole(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-all">Annuler</button>
                <button onClick={handleRoleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#00C9A7] text-white hover:bg-[#059669] transition-all active:scale-[0.98] disabled:opacity-50">
                  {loading ? "..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SuperAdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [bulkAction, setBulkAction] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["super-users"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UsersData>>("/admin/super/users");
      return res.data.data;
    },
  });

  const allUsers = data?.users ?? [];

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      const term = search.toLowerCase();
      if (term && !((u.username + " " + (u.full_name || "") + " " + (u.email || "")).toLowerCase().includes(term))) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      return true;
    });
  }, [allUsers, search, roleFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allUsers.length };
    allUsers.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [allUsers]);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    setPage(1);
    setBulkAction("");
    window.dispatchEvent(new CustomEvent("toast", { detail: { type: "info", message: `${selected.size} utilisateurs traités` } }));
    setSelected(new Set());
  };

  const perPage = 25;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Tous les utilisateurs</h1>
            <p className="text-sm text-white/40 mt-1">{filtered.length} utilisateurs · {roleCounts.pharmacist ?? 0} pharmaciens · {roleCounts.patient ?? 0} patients</p>
          </div>
          <button onClick={() => exportUsersCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#C084FC] bg-[#C084FC]/10 border border-[#C084FC]/20 hover:bg-[#C084FC]/20 transition-all active:scale-[0.97]">
            <Download size={14} />Export CSV
          </button>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 bg-[#0A1628] rounded-xl p-1 border border-[#00D4AA]/10">
            {["all", ...Object.keys(ROLE_CONFIG).filter((r) => r !== "super_admin")].map((r) => (
              <button key={r} onClick={() => { setRoleFilter(r === "all" ? "" : r); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  (r === "all" && !roleFilter) || roleFilter === r
                    ? "bg-[#00D4AA] text-white shadow-[0_2px_8px_rgba(0,201,167,0.3)]"
                    : "text-white/40 hover:text-white"
                }`}>
                {r === "all" ? "Tous" : r.charAt(0).toUpperCase() + r.slice(1)} ({roleCounts[r] ?? 0})
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, email..." className="w-full pl-9 pr-4 py-2.5 border border-[#00D4AA]/20 bg-[#0A1628] rounded-xl text-sm text-white focus:outline-none focus:border-[#00D4AA] placeholder-gray-500" />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#00C9A7] font-medium">{selected.size} sélectionné(s)</span>
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2.5 border border-[#00D4AA]/20 bg-[#0A1628] text-white rounded-xl text-xs focus:outline-none">
                <option value="">Action groupée...</option>
                <option value="disable">Désactiver</option>
                <option value="export">Exporter</option>
              </select>
              <button onClick={handleBulkAction} disabled={!bulkAction}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#00C9A7] text-white hover:bg-[#059669] transition-all disabled:opacity-40">
                Appliquer
              </button>
              <button onClick={() => setSelected(new Set())} className="px-3 py-2.5 rounded-xl text-xs text-white/40 hover:text-white transition-all">
                ✕
              </button>
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "rgba(10,22,40,0.6)" }} />)}</div>
        ) : (
          <motion.div variants={item} className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/40 bg-[#0D1E32]/80 border-b border-[#00D4AA]/10">
                    <th className="p-4">
                      <button onClick={toggleAll} className="text-white/40 hover:text-white transition-colors">
                        {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={14} className="text-[#00C9A7]" /> : <Square size={14} />}
                      </button>
                    </th>
                    <th className="p-4 text-xs font-medium">Utilisateur</th>
                    <th className="p-4 text-xs font-medium">Email</th>
                    <th className="p-4 text-xs font-medium">Rôle</th>
                    <th className="p-4 text-xs font-medium">Statut</th>
                    <th className="p-4 text-xs font-medium">Inscrit</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u) => {
                    const rc = ROLE_CONFIG[u.role] ?? { icon: <User size={14} />, color: "#00C9A7", bg: "rgba(0,201,167,0.1)" };
                    return (
                      <tr key={u.id} className="border-b border-[#00D4AA]/5 hover:bg-[#00D4AA]/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedUser(u)}>
                        <td className="p-4" onClick={(e) => { e.stopPropagation(); toggleOne(u.id); }}>
                          {selected.has(u.id) ? <CheckSquare size={14} className="text-[#00C9A7]" /> : <Square size={14} className="text-white/20" />}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: rc.bg, color: rc.color }}>
                              {(u.full_name ?? u.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.full_name || u.username}</p>
                              <p className="text-white/30 text-xs">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white/50 text-xs">{u.email || "—"}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: rc.bg, color: rc.color }}>
                            {rc.icon}{u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${u.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                            {u.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="p-4 text-white/30 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString("fr-TN") : "—"}</td>
                        <td className="p-4 text-white/20"><ChevronRight size={14} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-[#00D4AA]/10">
                <span className="text-xs text-white/30">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} sur {filtered.length}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20">‹</button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pg = i + 1;
                    return <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${page === pg ? "bg-[#00C9A7] text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}>{pg}</button>;
                  })}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20">›</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>{selectedUser && <UserSidePanel user={selectedUser} onClose={() => setSelectedUser(null)} />}</AnimatePresence>
      {selectedUser && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />}
    </RoleGuard>
  );
}