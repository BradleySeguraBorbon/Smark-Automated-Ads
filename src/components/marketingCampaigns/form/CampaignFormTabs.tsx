'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AudiencePreviewTable } from '@/components/marketingCampaigns/form/AudiencePreviewTable';
import { ConnectionsTab } from '@/components/marketingCampaigns/form/ConnectionsTab';
import { DetailsTab } from '@/components/marketingCampaigns/form/DetailsTab';
import { ITag } from '@/types/Tag';
import { IUser } from '@/types/User';
import { ClientRef } from '@/types/Client';
import { MarketingCampaignFormData } from '@/types/MarketingCampaign';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CampaignFormTabsProps {
  mode: 'new' | 'edit';
  onSubmitAction: (data: MarketingCampaignFormData) => void;
  allTags: ITag[];
  allUsers: IUser[];
  form: ReturnType<typeof useForm<MarketingCampaignFormData>>;
  campaignId?: string;
  isAiGenerated?: boolean;
  audienceClientIds?: string[];
}

export function CampaignFormTabs({
  mode,
  onSubmitAction,
  allTags,
  allUsers,
  form,
  campaignId,
  isAiGenerated = false,
  audienceClientIds
}: CampaignFormTabsProps) {
  const [audience, setAudience] = useState<ClientRef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'connections' | 'audience'>('details');
  const token = useAuthStore((state) => state.token);

  const formData = form.watch();

  useEffect(() => {
    const fetchAudience = async () => {
      try {
        setIsLoading(true);

        if (formData.isAiGenerated && mode === 'edit' && campaignId) {
          const res = await fetch(`/api/campaignAudiences/${campaignId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          setAudience(data.audience || []);
        }

        if (formData.isAiGenerated && mode === 'new' && audienceClientIds?.length) {
          const res = await fetch(`/api/clients/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: audienceClientIds }),
          });
          const data = await res.json();
          setAudience(data.results || []);
        }

        if (!formData.isAiGenerated && formData.tags.length > 0) {
          const tagQueryParams = formData.tags
            .map((tag) => `tagIds[]=${tag._id}`)
            .join('&');

          const res = await fetch(`/api/clients?${tagQueryParams}&limit=10&page=1`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          setAudience(data.results || []);
        }
      } catch (err) {
        console.error('Failed to fetch audience:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'audience') {
      fetchAudience();
    }
  }, [
    activeTab,
    formData.tags,
    formData._id,
    mode,
    campaignId,
    isAiGenerated,
    audienceClientIds
  ]);


  return (
    <form onSubmit={form.handleSubmit(onSubmitAction)}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'connections' | 'audience')} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6 rounded-lg border">
          <TabsTrigger value="details">Campaign Details</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="audience">Audience Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <DetailsTab form={form} />
        </TabsContent>

        <TabsContent value="connections">
          <ConnectionsTab form={form} allTags={allTags} allUsers={allUsers} />
        </TabsContent>

        <TabsContent value="audience">
          {isLoading ? (
            <div className="container mx-auto py-10">
              <LoadingSpinner />
              <p>Loading audience preview...</p>
            </div>
          ) : audience ? (
            <AudiencePreviewTable
              clients={audience}
              isAiGenerated={form.watch('isAiGenerated')}
              campaignId={String(form.watch('_id'))}
            />
          ) : (
            <div className="container mx-auto py-10">
              <LoadingSpinner />
              <p>Preparing audience preview...</p>
            </div>
          )}
        </TabsContent>

        <div className="text-sm text-muted-foreground mb-2 mt-3 text-center">
          Step {activeTab === 'details' ? 1 : activeTab === 'connections' ? 2 : 3} of 3
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              if (activeTab === 'connections') setActiveTab('details');
              if (activeTab === 'audience') setActiveTab('connections');
            }}
            disabled={activeTab === 'details'}
          >
            Previous
          </Button>

          <Button
            type="button"
            onClick={() => {
              if (activeTab === 'details') {
                setActiveTab('connections');
              } else if (activeTab === 'connections') {
                setActiveTab('audience');
              }
            }}
            disabled={activeTab === 'audience'}
          >
            Next
          </Button>
        </div>
      </Tabs>
    </form>
  );
}
