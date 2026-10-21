import { createFileRoute } from "@tanstack/react-router";
import { AuthPlaceholder } from "@/components/marketing/PlaceholderPage";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get Started — Majaa" },
      { name: "description", content: "Create your Majaa account and elevate your photo booth business." },
      { property: "og:title", content: "Get Started — Majaa" },
      { property: "og:description", content: "Create your Majaa account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthPlaceholder mode="signup" />,
});
