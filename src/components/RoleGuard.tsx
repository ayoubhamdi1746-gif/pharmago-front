"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthPayload, Role } from "@/lib/types";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Skeleton from "./Skeleton";

export default function RoleGuard({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: Role;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null | "loading">("loading");

  useEffect(() => {
    (async () => {
      const { getUserFromToken, clearTokens } = await import("@/lib/auth");
      const { getRedirectPath } = await import("@/lib/redirect");
      const u = await getUserFromToken();
      if (!u) {
        await clearTokens();
        router.push("/login");
        return;
      }
      if (u.role !== allowedRole) {
        router.push(getRedirectPath(u.role));
        return;
      }
      setUser(u);
    })();
  }, [allowedRole, router]);

  if (user === "loading") {
    return (
      <div className="min-h-screen bg-[#020814] p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020814] flex">
      <Sidebar role={allowedRole} />
      <div className="flex-1 flex flex-col">
        <Topbar role={allowedRole} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
