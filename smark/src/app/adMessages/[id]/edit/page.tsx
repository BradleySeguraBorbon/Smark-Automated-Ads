'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { decodeToken } from '@/lib/utils/decodeToken';
import { useAuthStore } from '@/lib/store';
import { IAdMessage } from '@/types/AdMessage';
import { Button } from '@/components/ui/button';
import { AdMessageFormTabs } from '@/components/adMessages/forms/AdMessageFormTabs';
import { AdMessageSummary } from '@/components/adMessages/forms/AdMessageSummary';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { transformAdMessageForSave } from '@/lib/transformers';
import { IMarketingCampaign } from "@/types/MarketingCampaign";
import { ITemplate } from "@/types/Template";

export default function EditAdMessagePage() {
  const router = useRouter();
  const { id } = useParams();
  const token = useAuthStore((state) => state.token);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [isLoading, setIsLoading] = useState(true);

  const [userInfo, setUserInfo] = useState<{ id: string; username: string; role: string } | null>(null);
  const [campaigns, setCampaigns] = useState<IMarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<IAdMessage>({
    defaultValues: {
      name: '',
      type: [],
      sendDate: undefined,
      attachments: [],
      content: {
        email: {
          subject: '',
          body: '',
        },
        telegram: {
          message: '',
          buttons: [],
        },
      },
    },
  });

  const { setValue } = form;

  const fetchCampaigns = async (userId: string) => {
    try {
      const response = await fetch(`/api/marketingCampaigns?assignedTo=${userId}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCampaigns(data.results || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTemplates(data.results || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchAdMessage = async () => {
    try {
      const response = await fetch(`/api/adMessages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        console.error('Fetch failed:', data);
        return;
      }

      const adMessage = {
        ...data.result,
        sendDate: data.result.sendDate ? new Date(data.result.sendDate) : undefined,
      };

      Object.entries(adMessage).forEach(([key, value]) => {
        setValue(key as keyof IAdMessage, value);
      });
    } catch (error) {
      console.error('Error fetching ad message:', error);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    const init = async () => {
      if (!token) return router.push('/auth/login');

      const user = await decodeToken(token);
      if (!user) return router.push('/auth/login');

      setUserInfo(user);

      await Promise.all([
        fetchCampaigns(user.id),
        fetchTemplates(),
        fetchAdMessage()
      ]);

      setIsLoading(false);
    };

    init();
  }, [_hasHydrated, token, id]);

  const handleUpdate = async (data: IAdMessage) => {
    try {
      const response = await fetch(`/api/adMessages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transformAdMessageForSave(data)),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Update failed:', result);
        return;
      }

      setSuccessOpen(true);
    } catch (error) {
      console.error('Failed to update ad message:', error);
    }
  };

  if (!_hasHydrated || !userInfo || isLoading) {
    return (
      <div className="container mx-auto py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <main>
        <div className="container mx-auto py-8 px-50">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/adMessages">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold ml-3">Edit Ad Message</h1>
          </div>

          <FormProvider {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdMessageFormTabs
                  mode="edit"
                  onSubmit={handleUpdate}
                  form={form}
                  token={token}
                  allMarketingCampaigns={campaigns}
                  allTemplates={templates}
                />
              </div>
              <div className="lg:col-span-1">
                <AdMessageSummary
                  onSubmitAction={handleUpdate}
                  mode="edit"
                />
              </div>
            </div>
          </FormProvider>

          <CustomAlertDialog
            open={successOpen}
            type="success"
            title="Ad Message Updated"
            description="The ad message was successfully updated."
            confirmLabel="Back to Ad Messages"
            onConfirmAction={() => {
              setSuccessOpen(false);
              router.push('/adMessages');
            }}
            onOpenChangeAction={setSuccessOpen}
          />
        </div>
      </main>
    </div>
  );
}
