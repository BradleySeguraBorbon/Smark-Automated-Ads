'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { IAdMessage } from '@/types/AdMessage';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Mail, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { IMarketingCampaign, MarketingCampaignRef } from '@/types/MarketingCampaign';
import {AdMessageFormData, FormMarketingCampaign} from '@/types/forms/AdMessageFormData';

interface DetailsTabProps {
    form: ReturnType<typeof useFormContext<AdMessageFormData>>
    campaigns: IMarketingCampaign[];
    messageTypes: { email: boolean; telegram: boolean };
    setMessageTypesAction: (val: { email: boolean; telegram: boolean }) => void;
}

export function DetailsTab({ form, campaigns, messageTypes, setMessageTypesAction }: DetailsTabProps) {
    const [minDate, setMinDate] = useState<Date | undefined>(undefined);
    const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        const selected = form.getValues('marketingCampaign');
        if (selected && selected.startDate && selected.endDate) {
            const start = new Date(selected.startDate);
            const end = new Date(selected.endDate);
            setMinDate(start);
            setMaxDate(end);

            const currentSendDate = form.getValues('sendDate');
            if (currentSendDate && (currentSendDate < start || currentSendDate > end)) {
                form.setValue('sendDate', new Date(currentSendDate));
            }
        }
    }, []);

    return (
        <Card>
            <CardContent className="pt-2 space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'Message name is required' }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message Name</FormLabel>
                            <FormControl>
                                <Input id="name" placeholder="Enter message name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="marketingCampaign"
                    rules={{ required: 'Campaign is required' }}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Marketing Campaign</FormLabel>
                            <Select
                                value={form.watch('marketingCampaign')?._id}
                                onValueChange={(selectedId) => {
                                    const selected = campaigns.find((c) => c._id === selectedId);
                                    if (selected) {
                                        form.setValue('marketingCampaign', selected as FormMarketingCampaign);

                                        const start = new Date(selected.startDate);
                                        const end = new Date(selected.endDate);
                                        setMinDate(start);
                                        setMaxDate(end);

                                        const currentSendDate = form.getValues('sendDate');
                                        if (currentSendDate && (currentSendDate < start || currentSendDate > end)) {
                                            form.setValue('sendDate', currentSendDate);
                                        }
                                    }
                                }}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select campaign">
                                            {form.watch('marketingCampaign')?.name}
                                        </SelectValue>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {campaigns.map((campaign) => (
                                        <SelectItem key={String(campaign._id)} value={String(campaign._id)}>
                                            {campaign.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sendDate"
                    rules={{ required: 'Send date is required' }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Send Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, 'PPP') : 'Select date'}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                        disabled={(date) => {
                                            if (minDate && date < minDate) return true;
                                            if (maxDate && date > maxDate) return true;
                                            return false;
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <FormLabel>Message Types</FormLabel>
                    <div className="flex flex-col space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>Email</span>
                            </div>
                            <Switch
                                checked={messageTypes.email}
                                onCheckedChange={(checked) => {
                                    const updated = { ...messageTypes, email: checked };
                                    setMessageTypesAction(updated);
                                    form.setValue('type', [
                                        ...(updated.email ? ['email' as const] : []),
                                        ...(updated.telegram ? ['telegram' as const] : []),
                                    ]);
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Telegram</span>
                            </div>
                            <Switch
                                checked={messageTypes.telegram}
                                onCheckedChange={(checked) => {
                                    const updated = { ...messageTypes, telegram: checked };
                                    setMessageTypesAction(updated);
                                    form.setValue('type', [
                                        ...(updated.email ? ['email' as const] : []),
                                        ...(updated.telegram ? ['telegram' as const] : []),
                                    ]);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}