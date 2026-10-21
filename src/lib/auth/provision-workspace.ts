import { api } from "@/lib/api/client";
import { organizationIdForUser } from "@/lib/auth/organization-id";
import { getSession, setSession } from "@/lib/auth/session";

export async function provisionSubscriberWorkspace(input: {
  userId: string;
  email: string;
  name: string;
  businessName?: string;
}): Promise<string> {
  const orgId = organizationIdForUser(input.userId);
  await api.ensureSubscriberOrganization({
    orgId,
    name: input.businessName?.trim() || `${input.name}'s business`,
    contactEmail: input.email,
  });

  const session = getSession();
  if (session?.id === input.userId) {
    setSession({ ...session, organizationId: orgId });
  }
  return orgId;
}
