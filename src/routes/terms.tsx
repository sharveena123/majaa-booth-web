import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/marketing/PlaceholderPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Majaa" },
      { name: "description", content: "The terms governing use of Majaa software and services." },
      { property: "og:title", content: "Terms of Service — Majaa" },
      { property: "og:description", content: "Terms for using Majaa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PlaceholderPage title="Terms of Service">
      <p>Our terms of service are being finalized and will be published here soon.</p>
    </PlaceholderPage>
  ),
});
