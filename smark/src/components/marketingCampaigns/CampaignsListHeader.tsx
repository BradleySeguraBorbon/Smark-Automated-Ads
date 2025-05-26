'use client'

import { Button } from "@/components/ui/button";
import { Filter, PlusCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

const CampaignsHeader = React.memo(({ userRole }: { userRole: string }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Manage your marketing campaigns</p>
        </div>
        <div className="flex gap-4">
            <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
            </Button>
            {userRole !== 'employee' &&
                <Button className="bg-purple-600 hover:bg-purple-800 text-white" asChild>
                    <Link href="/marketingCampaigns/new">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Campaign
                    </Link>
                </Button>
            }
        </div>
    </div>
));

export default CampaignsHeader;
