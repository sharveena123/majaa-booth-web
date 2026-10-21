import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ConnectivityBadge, LockBadge } from "@/components/dashboard/StatusBadge";
import { adminNav } from "@/components/dashboard/dashboard-nav";
import { api } from "@/lib/api/client";
import { deviceConnectivity } from "@/lib/api/mock-store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/devices/")({
  component: AdminDevicesPage,
});

function AdminDevicesPage() {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [sort, setSort] = useState("name");

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.listDevices(),
  });

  const { data: orgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => api.listOrganizations(),
  });

  const orgName = useMemo(() => {
    const map = new Map((orgs ?? []).map((o) => [o.id, o.name]));
    return (id: string) => map.get(id) ?? id;
  }, [orgs]);

  const rows = useMemo(() => {
    let list = [...(devices ?? [])];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          orgName(d.organizationId).toLowerCase().includes(q),
      );
    }
    if (orgFilter !== "all") list = list.filter((d) => d.organizationId === orgFilter);
    list.sort((a, b) => {
      if (sort === "ai") return b.aiPhotosGenerated - a.aiPhotosGenerated;
      if (sort === "online") return b.lastOnlineAt.localeCompare(a.lastOnlineAt);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [devices, search, orgFilter, sort, orgName]);

  return (
    <DashboardLayout variant="admin" nav={adminNav} title="Devices" breadcrumb="Licensing & connectivity">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <Input
          placeholder="Search devices…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-background/60"
        />
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-full max-w-xs bg-background/60">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organizations</SelectItem>
            {(orgs ?? []).map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full max-w-xs bg-background/60">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="online">Last online</SelectItem>
            <SelectItem value="ai">AI photos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Device</th>
              <th className="px-5 py-3">Organization</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Lock</th>
              <th className="px-5 py-3">AI photos</th>
              <th className="px-5 py-3">Last online</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              rows.map((d) => (
                <tr key={d.id} className="border-b border-border/60">
                  <td className="px-5 py-3">
                    <Link to="/admin/devices/$id" params={{ id: d.id }} className="font-medium hover:text-primary-glow">
                      {d.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{d.id}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{orgName(d.organizationId)}</td>
                  <td className="px-5 py-3">
                    <ConnectivityBadge status={deviceConnectivity(d.lastOnlineAt)} />
                  </td>
                  <td className="px-5 py-3">
                    <LockBadge locked={d.locked} />
                  </td>
                  <td className="px-5 py-3">{d.aiPhotosGenerated}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {format(parseISO(d.lastOnlineAt), "d MMM yyyy HH:mm")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
