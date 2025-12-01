import { useUser } from "@/components/contexts/UserContext";
import { Role } from "@prisma/client";
import { useMemo } from "react";

export function getUserAccess(role: Role, path: string): string[] {
  try {
    const permissions: { path: string; access: string[] }[] = JSON.parse(
      role.permission || "[]"
    );

    const found = permissions.find((p) => p.path === path);
    return found ? found.access : [];
  } catch {
    return [];
  }
}
export function hasAccess(role: Role, path: string, action: string): boolean {
  return getUserAccess(role, path).includes(action);
}

export function useAccess(path: string) {
  const user = useUser();
  // if (!user) return { access: [], hasAccess: (action: string) => false };
  const role = user?.Role ?? null;

  const access = useMemo(() => {
    if (!role) return [];
    return getUserAccess(role, path);
  }, [role, path]);

  const hasAccess = useMemo(
    () => (action: string) => access.includes(action),
    [access]
  );

  return { access, hasAccess };
}
