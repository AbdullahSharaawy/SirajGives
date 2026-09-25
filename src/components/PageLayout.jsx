
import Navbar from "./Navbar";
import LogoImage from '../assets/logo.png';
export default function PageLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <footer style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", padding: "1.5rem 0", textAlign: "center" }}>
        <div className="page-container">
         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <img 
              src={LogoImage} 
              alt="Siraj Logo" 
              style={{ 
                height: "100px"
                
              }} 
            />
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>
            منصة خيرية تجمع بين المتبرعين والمنظمات لخدمة المجتمع · جميع الحقوق محفوظة © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
