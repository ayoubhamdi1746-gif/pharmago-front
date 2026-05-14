"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import RoleGuard from "@/components/RoleGuard";
import NeoButton from "@/components/ui/NeoButton";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import type { ApiResponse, Role } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.12 } },
};

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
  page: number;
  per_page: number;
  total_pages: number;
}

const VALID_ROLES = ["patient", "pharmacist", "doctor", "driver", "admin", "super_admin"];

export default function SuperAdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [changingRole, setChangingRole] = useState<{ id: string; username: string } | null>(null);
  const [newRole, setNewRole] = useState("");
  const [deleting, setDeleting] = useState<{ id: string; username: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["super-users", page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UsersData>>("/admin/super/users", {
        params: { page, per_page: 50 },
      });
      return res.data.data;
    },
  });

  const handleRoleChange = async () => {
    if (!changingRole || !newRole) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/super/users/${changingRole.id}/role`, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ["super-users"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: `Rôle changé en ${newRole}` } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: "Échec du changement de rôle" } })
      );
    } finally {
      setActionLoading(false);
      setChangingRole(null);
      setNewRole("");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/super/users/${deleting.id}`);
      queryClient.invalidateQueries({ queryKey: ["super-users"] });
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "success", message: "Compte désactivé" } })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { type: "error", message: "Échec de la désactivation" } })
      );
    } finally {
      setActionLoading(false);
      setDeleting(null);
    }
  };

  return (
    <RoleGuard allowedRole="super_admin">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-6"
      >
        <motion.div variants={item}>
          <h1 className="text-2xl font-semibold text-[#022C22]">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} utilisateurs au total</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-card animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <motion.div variants={item} className="space-y-2">
              {(data?.users ?? []).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-[#F0FDF9] border border-[#A7F3D0] rounded-card hover:border-[#00D4AA] transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#022C22]">
                      {u.full_name || u.username}
                      {!u.is_active && (
                        <span className="ml-2 text-xs text-[#FF4D6D]">(désactivé)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {u.username} &middot; {u.email ?? "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      u.role === "super_admin" ? "bg-red-100 text-red-700" :
                      u.role === "admin" ? "bg-purple-100 text-purple-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role}
                    </span>
                    {u.role !== "super_admin" && (
                      <>
                        <NeoButton
                          onClick={() => { setChangingRole({ id: u.id, username: u.username }); setNewRole(u.role); }}
                          variant="neumorphic"
                          size="sm"
                        >
                          Changer rôle
                        </NeoButton>
                        {u.is_active && (
                          <NeoButton
                            onClick={() => setDeleting({ id: u.id, username: u.username })}
                            variant="ghost"
                            size="sm"
                            className="text-[#FF4D6D] hover:bg-[#FF4D6D]/10"
                          >
                            Désactiver
                          </NeoButton>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {data && data.total_pages > 1 && (
              <motion.div variants={item} className="flex items-center justify-center gap-3 pt-4">
                <NeoButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  variant="primary"
                  size="sm"
                >
                  Précédent
                </NeoButton>
                <span className="text-sm text-gray-500">
                  Page {data.page} / {data.total_pages}
                </span>
                <NeoButton
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page >= data.total_pages}
                  variant="primary"
                  size="sm"
                >
                  Suivant
                </NeoButton>
              </motion.div>
            )}
          </>
        )}

        {changingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setChangingRole(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-[#F0FDF9] border border-[#A7F3D0] rounded-card shadow-soft p-6 max-w-sm w-full space-y-4"
            >
              <h3 className="text-lg font-semibold text-[#022C22]">
                Changer le rôle — {changingRole.username}
              </h3>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-[#A7F3D0] bg-white text-[#022C22] text-sm"
              >
                {VALID_ROLES.filter((r) => r !== "super_admin").map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="flex gap-3 justify-end">
                <NeoButton onClick={() => setChangingRole(null)} variant="ghost" size="md">Annuler</NeoButton>
                <NeoButton onClick={handleRoleChange} disabled={actionLoading} loading={actionLoading} variant="primary" size="md">Confirmer</NeoButton>
              </div>
            </motion.div>
          </div>
        )}

        <Modal
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          title="Désactiver le compte"
          message={`Voulez-vous vraiment désactiver le compte de ${deleting?.username} ?`}
          confirmLabel="Désactiver"
          variant="danger"
        />
      </motion.div>
    </RoleGuard>
  );
}
