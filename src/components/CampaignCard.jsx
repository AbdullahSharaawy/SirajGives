import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";



export default function CampaignCard({ c }) {
  const nav = useNavigate();
  const kind = c.isSolo ? "solo" : "shared";
  return (
    <div className="campaign-card" onClick={() => nav(`/campaigns/${kind}/${c.id}`)}>
      <div className="campaign-card__img">
        <img
          src={c.imageUrl ?? `https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=200&fit=crop&auto=format`}
          alt={c.title}
        />
      </div>
      <div className="campaign-card__body">
        {c.organizationName && (
          <div className="campaign-card__org">{c.organizationName}</div>
        )}
        <div className="campaign-card__title">{c.title}</div>
        <ProgressBar value={c.collectedMoney ?? 0} max={c.targetMoney} label />
        <div className="campaign-card__footer">
          <span>
            {c.daysLeft != null
              ? c.daysLeft > 0
                ? `${c.daysLeft} يوم متبقي`
                : "انتهت"
              : ""}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {c.type && <span className="badge badge--green">{c.type}</span>}
            {!c.isSolo && <span className="badge badge--blue">مشتركة</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
