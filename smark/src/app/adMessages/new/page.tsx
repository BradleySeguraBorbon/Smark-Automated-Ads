'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { decodeToken } from '@/lib/utils/decodeToken';
import { useAuthStore } from '@/lib/store';
import { IAdMessage } from '@/types/AdMessage';
import { Button } from '@/components/ui/button';
import { AdMessageFormTabs } from '@/components/adMessages/forms/AdMessageFormTabs';
import { AdMessageSummary } from '@/components/adMessages/forms/AdMessageSummary';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import { transformAdMessageForSave } from '@/lib/transformers';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NewAdMessagePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const [userInfo, setUserInfo] = useState<{ id: string; username: string; role: string } | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
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

  const fetchCampaigns = async (userId: string) => {
    try {
      const response = await fetch(`/api/marketingCampaigns?assignedTo=${userId}&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setTemplates(data.results || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    const init = async () => {
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const user = await decodeToken(token);
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserInfo(user);
      await fetchCampaigns(user.id);
      await fetchTemplates();
    };

    init();
  }, [_hasHydrated, token]);

  const handleCreate = async (data: IAdMessage) => {
    try {
      data.status = 'programmed';
      const response = await fetch('/api/adMessages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transformAdMessageForSave(data)),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error(result);
        return;
      }

      setSuccessOpen(true);
    } catch (error) {
      console.error('Failed to create ad message:', error);
    }
  };

  if (!_hasHydrated || !userInfo) {
    return (
      <div className="container mx-auto py-10">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <main>
        <div className="container mx-auto py-8 px-24">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/adMessages">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold ml-3">Create New Ad Message</h1>
          </div>

          <FormProvider {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 w-full">
                <AdMessageFormTabs
                  mode="new"
                  onSubmit={handleCreate}
                  token={token}
                  form={form}
                  allMarketingCampaigns={campaigns}
                  allTemplates={templates}
                />
              </div>
              <div className="lg:col-span-1">
                <AdMessageSummary
                  onSubmitAction={handleCreate}
                  mode="new"
                  campaignName={
                    campaigns.find((c) => c.id === form.watch('marketingCampaign'))?.name || ''
                  }
                />
              </div>
            </div>
          </FormProvider>

          <CustomAlertDialog
            open={successOpen}
            type="success"
            title="Ad Message Created"
            description="The ad message was successfully created."
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