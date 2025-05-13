import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { TagSelector } from "@/components/marketingCampaigns/form/TagSelector";
import { MarketingCampaignFormData } from "@/types/MarketingCampaign";
import { ITag, TagRef } from "@/types/Tag";
import { TeamMemberSelector } from './TeamMemberSelector';
import { IUser, UserRef } from "@/types/User";

export function ConnectionsTab({
  form,
  allTags,
  allUsers,
}: {
  form: ReturnType<typeof useFormContext<MarketingCampaignFormData>>;
  allTags: ITag[];
  allUsers: IUser[];
}) {
  const selectedTags = form.watch('tags');
  const selectedUsers = form.watch('users');

  return (
    <Card >
      <CardContent className="pt-2 px-4 md:px-6 space-y-6">
        <div className='space-y-3'>
          <Label>Campaign Tags</Label>
          <TagSelector
            tags={allTags as TagRef[]}
            selectedTags={selectedTags}
            onChange={(updated) => form.setValue('tags', updated)}
          />
        </div>
        <div className='space-y-3'>
          <Label>Campaign Team</Label>
          <TeamMemberSelector
            users={allUsers as UserRef[]}
            selectedUsers={selectedUsers}
            onChange={(updated) => form.setValue('users', updated)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
