import {
  Camera, Layers, Sparkles, LayoutTemplate, QrCode, MonitorSmartphone, Printer,
  type LucideIcon,
} from "lucide-react";

export const navLinks = [
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

export const features: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Camera, title: "Photo Booth", desc: "Canon and webcam capture with professional, studio-grade printing." },
  { icon: Layers, title: "Lenticular", desc: "Specialized lenticular photo workflows, built in." },
  { icon: Sparkles, title: "AI Photobooth", desc: "AI-generated scenes and creative portraits in seconds." },
  { icon: LayoutTemplate, title: "Layout Designer", desc: "Custom photo strips with precise print alignment." },
  { icon: QrCode, title: "Cloud QR", desc: "Instant gallery access with background uploads." },
  { icon: MonitorSmartphone, title: "Device Management", desc: "Machine licensing and per-device feature permissions." },
  { icon: Printer, title: "Print Integration", desc: "Compatible printer support, including DNP workflows." },
];

// Illustrative placeholder prices — edit here.
export const pricing = [
  {
    name: "Starter", price: "RM —", period: "/month", tagline: "For your first booth.",
    features: ["1 licensed machine", "Photo mode", "100 AI generations / mo", "Cloud galleries (30 days)", "Business dashboard"],
  },
  {
    name: "Professional", price: "RM —", period: "/month", tagline: "For growing booth businesses.", highlighted: true,
    features: ["Up to 3 machines", "Photo + Video Guestbook", "1,000 AI generations / mo", "Cloud galleries (90 days)", "Bookings & revenue dashboard"],
  },
  {
    name: "Premium", price: "RM —", period: "/month", tagline: "For multi-booth operators.",
    features: ["Up to 10 machines", "Photo, Video & Lenticular", "5,000 AI generations / mo", "Cloud galleries (1 year)", "Full business suite"],
  },
];

export const faqs = [
  { q: "What is Majaa?", a: "Majaa is an all-in-one photo booth platform: a desktop app that runs your booth, plus a web dashboard to manage machines, bookings, and revenue." },
  { q: "What hardware do I need?", a: "A Windows PC, a supported Canon camera or webcam, and a compatible printer such as DNP. A touchscreen is recommended." },
  { q: "How does device activation work?", a: "Each machine is activated with a license from your dashboard. You can transfer or revoke licenses at any time." },
  { q: "Can I use multiple machines?", a: "Yes. Plans include different machine allowances, and every machine is managed from one dashboard." },
  { q: "How do feature permissions work?", a: "Features like Video, Lenticular, and AI are enabled per machine based on your plan, so each booth only shows what it should." },
  { q: "Where are my event photos stored?", a: "Photos are saved locally first and uploaded in the background to secure cloud galleries for QR delivery." },
  { q: "Can guests download without an account?", a: "Yes. Guests scan a QR code and download directly — no sign-up needed." },
  { q: "What happens when my subscription expires?", a: "Machines lock premium features until renewal. Your existing galleries and settings are kept safe." },
  { q: "Can I manage bookings and revenue?", a: "Yes. The web platform tracks events, orders, and revenue across all your machines." },
  { q: "Can Majaa support offline events?", a: "Yes. The booth runs fully offline and syncs uploads automatically once a connection returns." },
];
