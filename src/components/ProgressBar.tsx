interface Props { value: number; max: number; label?: boolean }
export default function ProgressBar({ value, max, label }: Props) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) ? max : 0;
  const pct = safeMax > 0 ? Math.min(100, Math.round((safeValue / safeMax) * 100)) : 0;
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontSize: "0.68rem", color: "var(--brand-green)", fontWeight: 700 }}>
            {safeValue.toLocaleString("ar-EG")} ج.م
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--muted-text)" }}>
            {pct}٪
          </span>
        </div>
      )}
    </div>
  );
}
