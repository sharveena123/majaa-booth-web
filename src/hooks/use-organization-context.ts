import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { organizationIdForUser } from "@/lib/auth/organization-id";
import { provisionSubscriberWorkspace } from "@/lib/auth/provision-workspace";
import { getActiveOrganizationId, getSession, type SessionUser } from "@/lib/auth/session";

export function useOrganizationContext() {
  const { user, isLoading: authLoading } = useAuth();
  const session: SessionUser | null =
    user ?? (typeof window !== "undefined" ? getSession() : null);

  const orgId = session?.id
    ? (getActiveOrganizationId(session) ?? organizationIdForUser(session.id))
    : null;

  useEffect(() => {
    if (!session?.id || !orgId || session.role !== "subscriber") return;
    if (session.authProvider !== "firebase") return;
    void provisionSubscriberWorkspace({
      userId: session.id,
      email: session.email,
      name: session.name,
    });
  }, [session?.id, session?.email, session?.name, session?.role, session?.authProvider, orgId]);

  const ready = !!orgId && (!authLoading || !!session);

  return { orgId, session, ready, authLoading };
}
