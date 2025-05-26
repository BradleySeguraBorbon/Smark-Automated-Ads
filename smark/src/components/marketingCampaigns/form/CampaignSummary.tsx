'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MarketingCampaignFormData } from '@/types/MarketingCampaign';
import { Tag } from 'lucide-react';

export function CampaignSummary({
  onSubmitAction,
  mode,
}: {
  onSubmitAction: (data: MarketingCampaignFormData) => void,
  mode: 'new' | 'edit';
}) {
  const { watch } = useFormContext<MarketingCampaignFormData>();
  const status = watch('status');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const users = watch('users');
  const tags = watch('tags');

  const { handleSubmit } = useFormContext<MarketingCampaignFormData>();

  return (
    <Card >
      <CardContent className="pt-1">
        <h3 className="font-semibold mb-4">Campaign Summary</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="capitalize">{status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date Range</p>
            <p>
              {startDate ? format(startDate, 'MMM d, yyyy') : 'Not set'}
              {endDate ? ` - ${format(endDate, 'MMM d, yyyy')}` : ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Team</p>
            <div className="flex gap-2 mt-1">
              {users && users.length > 0 ? (
                <p>{users.length} team members</p>
              ) : (
                <p className="text-muted-foreground">No team members selected</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {tags && tags.length > 0 ? (
                tags.map((tag) => (
                  <Badge key={tag._id} variant="outline" className="bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 ease-in-out">
                    <Tag className="h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No tags selected</p>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Button className="w-full bg-purple-600 hover:bg-purple-800 text-white" onClick={handleSubmit(onSubmitAction)}>
              {mode === 'edit' ? 'Save Changes' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
