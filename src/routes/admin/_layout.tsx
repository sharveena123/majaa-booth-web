import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRoles } from "@/lib/auth/guards";

export const Route = createFileRoute("/admin/_layout")({
  beforeLoad: ({ location }) => {
    requireRoles(["superadmin"], location.pathname);
  },
  component: () => <Outlet />,
});
