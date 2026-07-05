"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "32rem",
              border: "1px solid #262626",
              background: "#141414",
              padding: "2rem",
            }}
          >
            <div
              style={{
                margin: "0 auto 1.5rem",
                width: "fit-content",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                padding: "1.25rem",
              }}
            >
              <AlertTriangle
                style={{ width: 48, height: 48, color: "#ef4444" }}
                strokeWidth={1.5}
              />
            </div>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.875rem", fontWeight: 700 }}>
              Critical error
            </h2>
            <p
              style={{
                margin: "0 auto 2rem",
                maxWidth: "28rem",
                color: "#a3a3a3",
                lineHeight: 1.6,
              }}
            >
              A critical error has occurred. Our team has been notified.
              {process.env.NODE_ENV === "development" && (
                <>
                  <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                    {error.message}
                  </span>
                  {error.digest && (
                    <span
                      style={{
                        display: "block",
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#737373",
                      }}
                    >
                      Error ID: {error.digest}
                    </span>
                  )}
                </>
              )}
            </p>
            <button
              onClick={reset}
              style={{
                cursor: "pointer",
                border: "none",
                background: "#bef264",
                color: "#0a0a0a",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "0.75rem 2.5rem",
              }}
            >
              Reload application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
