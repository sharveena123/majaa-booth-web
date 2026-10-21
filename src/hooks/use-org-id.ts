import { useOrganizationContext } from "./use-organization-context";

/** Active organization id for the signed-in subscriber (never throws). */
export function useOrganizationId(): string {
  const { orgId } = useOrganizationContext();
  return orgId ?? "";
}

export { useOrganizationContext } from "./use-organization-context";
