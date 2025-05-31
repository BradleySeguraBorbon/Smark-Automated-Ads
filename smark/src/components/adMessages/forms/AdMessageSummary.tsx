'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Mail, MessageSquare } from 'lucide-react';
import { IAdMessage } from '@/types/AdMessage';
import { AdMessageFormData } from '@/types/forms/AdMessageFormData';

interface AdMessageSummaryProps {
  onSubmitAction: (data: AdMessageFormData) => void;
  mode: 'new' | 'edit';
}

export function AdMessageSummary({ onSubmitAction, mode }: AdMessageSummaryProps) {
  const { watch, handleSubmit } = useFormContext<AdMessageFormData>();
  const name = watch('name');
  const campaign = watch('marketingCampaign');
  const sendDate = watch('sendDate');
  const attachments = watch('attachments') || [];
  const telegramButtons = watch('content.telegram.buttons') || [];
  const messageTypes = {
    email: watch('type')?.includes('email'),
    telegram: watch('type')?.includes('telegram'),
  };

  return (
    <Card>
      <CardContent className="pt-1">
        <h3 className="font-semibold mb-4">Message Summary</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p>{name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Campaign</p>
            <p>{campaign?.name || 'Not selected'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Send Date</p>
            <p>{sendDate ? format(sendDate, 'MMM d, yyyy') : 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Message Types</p>
            <div className="flex gap-2 mt-1">
              {messageTypes.email && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Badge>
              )}
              {messageTypes.telegram && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Telegram
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Attachments</p>
            <p>
              {attachments.length > 0
                ? `${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`
                : 'No attachments'}
            </p>
          </div>
          {messageTypes.telegram && (
            <div>
              <p className="text-sm text-muted-foreground">Telegram Buttons</p>
              <p>
                {telegramButtons.length > 0
                  ? `${telegramButtons.length} button${telegramButtons.length > 1 ? 's' : ''}`
                  : 'No buttons'}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant="outline">{mode === 'edit' ? 'Editing' : 'Draft'}</Badge>
          </div>
        </div>

        <div className="mt-8">
          <Button className="w-full bg-purple-600 hover:bg-purple-800 text-white" onClick={handleSubmit(onSubmitAction)}>
            {mode === 'edit' ? 'Save Changes' : 'Create Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
