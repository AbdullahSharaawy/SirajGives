import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <footer style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", padding: "1.5rem 0", textAlign: "center" }}>
        <div className="page-container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
            <div className="navbar__logo-mark" style={{ width: 28, height: 28, fontSize: "0.9rem" }}>س</div>
            <span style={{ fontWeight: 800, color: "var(--heading-text)" }}>سِراج</span>
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>
            منصة خيرية تجمع بين المتبرعين والمنظمات لخدمة المجتمع · جميع الحقوق محفوظة © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
