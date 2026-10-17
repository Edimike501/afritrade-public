import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const alt = "AfriTrade Connect — Intra-African B2B Trade & Logistics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#064e3b",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #047857 2%, transparent 0%), radial-gradient(circle at 75px 75px, #065f46 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "80px",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "9999px",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            AfCFTA B2B MARKETPLACE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "64px", fontWeight: 900, lineHeight: 1.1, color: "#ffffff" }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: "28px", color: "#a7f3d0", maxWidth: "900px", lineHeight: 1.4 }}>
            {siteConfig.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "2px solid #065f46",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "20px", color: "#6ee7b7" }}>Nigeria · South Africa · Ghana</span>
          <span style={{ fontSize: "20px", color: "#6ee7b7" }}>
            Verified Suppliers · Multi-Currency · Curated Logistics
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
