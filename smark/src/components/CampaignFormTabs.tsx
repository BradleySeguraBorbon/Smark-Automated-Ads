'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AudiencePreviewTable } from '@/components/AudiencePreviewTable';
import { ConnectionsTab } from '@/components/ConnectionsTab';
import { DetailsTab } from '@/components/DetailsTab';
import { ITag } from '@/types/Tag';
import { IUser } from '@/types/User';
import { IClient, ClientRef } from '@/types/Client';
import { MarketingCampaignFormData } from '@/types/MarketingCampaign';

interface CampaignFormTabsProps {
  mode: 'new' | 'edit';
  onSubmit: (data: MarketingCampaignFormData) => void;
  allTags: ITag[];
  allUsers: IUser[];
  form: ReturnType<typeof useForm<MarketingCampaignFormData>>;
}

export function CampaignFormTabs({
  mode,
  onSubmit,
  allTags,
  allUsers,
  form,
}: CampaignFormTabsProps) {
  const [audience, setAudience] = useState<ClientRef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'connections' | 'audience'>('details');

  const formData = form.watch();

  useEffect(() => {
    if (activeTab === 'audience') {
      const fetchAudience = async () => {
        try {
          setIsLoading(true);
          if (formData.tags.length > 0) {
            const tagQueryParams = formData.tags
              .map((tag) => `tagIds[]=${tag._id}`)
              .join('&');

            const res = await fetch(`/api/clients?${tagQueryParams}&limit=10&page=1`, {
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
              },
            });
            const data = await res.json();
            if (data.results) {
              setAudience(data.results as ClientRef[]);
            } else {
              setAudience([]);
            }
          }
        } catch (err) {
          console.error('Failed to fetch audience:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAudience();
    }
  }, [activeTab, formData.tags, formData._id, mode]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
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
            <p>Loading audience preview...</p>
          ) : audience ? (
            <AudiencePreviewTable clients={audience} />
          ) : (
            <p>Preparing audience preview...</p>
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
