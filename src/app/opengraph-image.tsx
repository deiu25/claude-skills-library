import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#09090b",
          color: "#f4f4f5",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#3ecf8e",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 28, color: "#a1a1aa", display: "flex" }}>
            claude-skills-library
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2, display: "flex" }}>
            Claude Code skills,
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#3ecf8e",
              display: "flex",
            }}
          >
            curated and explained.
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#a1a1aa", display: "flex" }}>
          when to use each skill + how to install it + live GitHub stats
        </div>
      </div>
    ),
    size,
  );
}
