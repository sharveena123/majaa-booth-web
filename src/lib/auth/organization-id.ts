/** Stable org id for a Firebase subscriber (until a backend assigns orgs). */
export function organizationIdForUser(userId: string): string {
  return `org-${userId.slice(0, 16)}`;
}
