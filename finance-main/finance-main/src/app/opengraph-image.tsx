import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Accounting Room — Tax & Accounting Services South Africa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #4F5B35 0%, #6B7A45 50%, #3d4728 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle gold glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,169,106,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "rgba(201,169,106,0.2)",
            border: "2px solid rgba(201,169,106,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "32px",
            fontSize: "28px",
            fontWeight: "800",
            color: "#C9A96A",
          }}
        >
          A
        </div>

        {/* Tag */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#C9A96A",
            marginBottom: "20px",
          }}
        >
          Managed Finance Services
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "60px",
            fontWeight: "800",
            color: "#F8F6F1",
            lineHeight: 1.1,
            marginBottom: "24px",
            maxWidth: "800px",
          }}
        >
          The Accounting Room
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(248,246,241,0.65)",
            maxWidth: "680px",
            lineHeight: 1.5,
          }}
        >
          Tax returns, bookkeeping, payroll &amp; CIPC services in South Africa.
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "80px",
            fontSize: "16px",
            color: "rgba(248,246,241,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          theaccountingroom.org
        </div>
      </div>
    ),
    { ...size }
  );
}
