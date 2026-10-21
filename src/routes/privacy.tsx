import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/marketing/PlaceholderPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Majaa" },
      { name: "description", content: "How Majaa collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy — Majaa" },
      { property: "og:description", content: "How Majaa handles your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PlaceholderPage title="Privacy Policy">
      <p>Our full privacy policy is being finalized and will be published here soon.</p>
    </PlaceholderPage>
  ),
});
