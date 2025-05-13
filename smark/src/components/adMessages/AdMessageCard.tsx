import { useState } from "react";
import { format } from "date-fns";
import { IAdMessage } from "@/types/AdMessage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import Link from "next/link";
import CustomAlertDialog from "@/components/CustomAlertDialog";


interface AdMessageCardProps {
    adMessage: IAdMessage;
    onDelete: () => void;
    userRole: string;
}

const getStatusVariant = (status: string | undefined) => {
    switch (status) {
        case "sent":
            return "secondary"
        case "editing":
            return "outline"
        case "programmed":
            return "default"
        default:
            return "outline"
    }
}

export function AdMessageCard({ adMessage, onDelete, userRole }: AdMessageCardProps) {
    const [alertOpen, setAlertOpen] = useState(false);

    return (
        <>
            <Card key={adMessage.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-xl">{adMessage.name}</CardTitle>
                        <CardDescription>Campaign: {adMessage.marketingCampaign.name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(adMessage.status)} className="capitalize">
                            {adMessage.status}
                        </Badge>
                        <Button variant="secondary" className="bg-red-500 hover:bg-red-800" size="icon" onClick={() => setAlertOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {adMessage.type.includes("email") && <Mail className="h-4 w-4 text-muted-foreground mr-1" />}
                                {adMessage.type.includes("telegram") && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <span>{adMessage.type.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(" & ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(adMessage.sendDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span>{adMessage.attachments?.length ?? 0} attachment{adMessage.attachments?.length === 1 ? '' : 's'}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex gap-2">
                        <Button variant="default" className="bg-slate-600 hover:bg-slate-800 text-white" size="sm" asChild>
                            <Link href={`/adMessages/${adMessage._id}`}>View Details</Link>
                        </Button>
                        {adMessage.status !== "sent" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-800 text-white" asChild>
                                <Link href={`/adMessages/${adMessage._id}/edit`}>Edit Message</Link>
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
            <CustomAlertDialog
                open={alertOpen}
                type="warning"
                title="Delete AdMessage"
                description={'Are you sure you want to delete "${adMessage.name}"? This action cannot be undone.'}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={onDelete}
                onCancel={() => setAlertOpen(false)}
                onOpenChange={setAlertOpen}
            />
        </>
    )

}