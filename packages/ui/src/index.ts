"use client";

// Universal API Client
export * from "./api/client";

// Auth & Session
export * from "./auth/AuthContext";
export * from "./auth/guards";


// Master Design System Components (DESIGN.md §9)
export * from "./components/Button";
export * from "./components/Input";
export * from "./components/Textarea";
export * from "./components/Badge";
export * from "./components/Card";
export * from "./components/Modal";
export * from "./components/Sheet";
export * from "./components/OrderTracker";
export * from "./components/PriceDisplay";
export * from "./components/MetricCard";
export * from "./components/DataTable";
export * from "./components/EmptyState";
export * from "./components/ViewModeToggle";
export * from "./components/CurrencySelector";
export * from "./components/Dropdown";
export * from "./components/ThemeProvider";
export * from "./components/ThemeToggle";
export * from "./components/Brand";
export * from "./components/VerificationWarningBanner";
export * from "./components/BusinessProfileDrawer";

// Legacy View Helpers
export { ErrorBox, Loading, Money, Stat } from "./components/ui";
export * from "./components/DashboardView";
export * from "./components/ShipmentPanel";
export * from "./components/OrderTable";

// Curated Lucide Icons
export * from "./icons";

// Utilities & Styling
export * from "./lib/utils";
export * from "./tailwind.preset";
