import type { Role } from "./types";

export function getRedirectPath(role: Role): string {
  const map: Record<Role, string> = {
    patient: "/patient/dashboard",
    pharmacist: "/pharmacist/dashboard",
    doctor: "/doctor/dashboard",
    driver: "/driver/dashboard",
    admin: "/admin/dashboard",
    super_admin: "/super-admin/dashboard",
  };
  return map[role] || "/login";
}
