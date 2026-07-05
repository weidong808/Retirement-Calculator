import { ImageResponse } from "next/og";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0b1f38 0%, #123c5e 55%, #0f766e 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, display: "flex" }}>
              Retire<span style={{ color: "#34d399" }}>Check</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, display: "flex" }}>
              Will your money last in retirement?
            </div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.82)", lineHeight: 1.35, maxWidth: 900, display: "flex" }}>
              {APP_DESCRIPTION}
            </div>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            {["1,000-scenario Monte Carlo", "Social Security timing", "Free · No sign-up"].map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "12px 24px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
