import { createFileRoute } from "@tanstack/react-router";
import { AuthPlaceholder } from "@/components/marketing/PlaceholderPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Majaa" },
      { name: "description", content: "Sign in to your Majaa photo booth business account." },
      { property: "og:title", content: "Sign In — Majaa" },
      { property: "og:description", content: "Sign in to your Majaa account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthPlaceholder mode="login" />,
});
