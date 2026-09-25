export const numberValue = (value) => {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const normalizeCampaign = (campaign) => {
  if (!campaign) return null;
  const collected = numberValue(
    campaign.collectedMoney ?? campaign.currentAmount ?? campaign.raisedAmount ?? campaign.collected ?? campaign.totalRaised
  );
  const target = numberValue(campaign.targetMoney ?? campaign.targetAmount ?? campaign.goal ?? campaign.target);
  const type = campaign.type ?? campaign.campaignType;
  const isSolo = campaign.isSolo ?? String(type).toLowerCase() === "solo";
  const organizationId = campaign.organizationId ?? campaign.organization?.id ?? campaign.orgId;

  return {
    ...campaign,
    id: campaign.id ?? campaign.campaignId,
    title: campaign.title ?? campaign.name ?? "حملة خيرية",
    organizationName: campaign.organizationName ?? campaign.organization?.name ?? campaign.org ?? "",
    organizationId,
    collectedMoney: collected,
    targetMoney: target,
    daysLeft: campaign.daysLeft ?? campaign.daysRemaining ?? campaign.remainingDays,
    type,
    status: campaign.status ?? campaign.campaignStatus,
    imageUrl: campaign.imageUrl ?? campaign.image,
    isSolo,
    donors: numberValue(campaign.donors ?? campaign.donorCount ?? campaign.donationsCount),
    description: campaign.description ?? campaign.details ?? "",
    updates: asArray(campaign.updates ?? campaign.timeline),
    deleted: Boolean(campaign.deleted || campaign.isDeleted),
  };
};

export const normalizeOrganization = (organization) => {
  if (!organization) return null;
  return {
    ...organization,
    id: organization.id ?? organization.organizationId,
    name: organization.name ?? organization.organizationName ?? "منظمة",
    address: organization.address ?? "",
    campaigns: organization.campaignCount ?? organization.campaignsCount ?? organization.campaigns ?? 0,
    verified: organization.verified ?? organization.isVerified ?? true,
    desc: organization.description ?? "",
    imageUrl: organization.imageUrl ?? organization.image ?? organization.logoUrl ?? organization.img,
    deleted: Boolean(organization.deleted || organization.isDeleted),
    hasPayment: Boolean(organization.hasPaymentInfo || organization.paymentInfo || organization.payment),
  };
};

export const campaignStatusLabel = (status) => {
 const labels = {
  Preparing: "تُحضر",
  Active: "نشطة",
  Completed: "مكتملة",
  Dismissed: "مستبعدة",
  Postponed: "مؤجلة",
  Expired: "منتهية",
  
};
  return labels[status] ?? status;
};

export const campaignStatusValue = (status) => {
  const values = {
    نشطة: "Active",
    مكتملة: "Completed",
    تُحضر:"Preparing",
 مستبعدة:"Dismissed",
 مؤجلة:"Postponed",
 منتهية:"Expired"
  };
  return values[status] ?? status;
};
