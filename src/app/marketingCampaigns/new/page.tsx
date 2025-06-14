'use client';

import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import NewCampaignPage from "@/components/marketingCampaigns/NewCampaignPage";

export default function NewCampaignPageWrapper() {
    return (
        <Suspense fallback={<div className="py-10"><LoadingSpinner /></div>}>
            <NewCampaignPage />
        </Suspense>
    );
}
