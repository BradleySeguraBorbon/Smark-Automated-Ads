import { Badge } from "@/components/ui/badge";

interface CampaignStatusBadgeProps {
    status: 'active' | 'inactive' | 'completed';
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
    let colorVariant: 'default' | 'destructive' | 'secondary';

    switch (status) {
        case 'active':
            colorVariant = 'default';
            break;
        case 'completed':
            colorVariant = 'secondary';
            break;
        case 'inactive':
        default:
            colorVariant = 'destructive';
            break;
    }

    return (
        <Badge variant={colorVariant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
