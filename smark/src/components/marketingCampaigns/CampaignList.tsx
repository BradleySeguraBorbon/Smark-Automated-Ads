import { CampaignCard } from "./CampaignCard"
import { IMarketingCampaign } from "@/types/MarketingCampaign"

export default function CampaignList({
     campaigns,
     onDelete,
     userRole,
}: {
    campaigns: IMarketingCampaign[],
    onDelete: (id: string) => void,
    userRole: string
}) {
    return (
        <div className="grid gap-6">
            {campaigns.map((campaign) => (
                <CampaignCard
                    key={String(campaign._id)}
                    campaign={campaign}
                    onDelete={() => onDelete(String(campaign._id))}
                    userRole={userRole}
                />
            ))}
        </div>
    );
}