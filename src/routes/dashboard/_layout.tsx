import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRoles } from "@/lib/auth/guards";

export const Route = createFileRoute("/dashboard/_layout")({
  beforeLoad: ({ location }) => {
    requireRoles(["subscriber", "superadmin"], location.pathname);
  },
  component: () => <Outlet />,
});
