import { useState, useEffect } from "react";
import { IAdMessage } from "@/types/AdMessage";
import { IMarketingCampaign } from "@/types/MarketingCampaign";
import { ITemplate } from "@/types/Template";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailsTab } from "@/components/adMessages/forms/DetailsTab";
import { EmailContentTab } from "@/components/adMessages/forms/EmailContentTab";
import { TelegramContentTab } from "@/components/adMessages/forms/TelegramContentTab";
import LoadingSpinner from "@/components/LoadingSpinner";
import {AdMessageFormData} from "@/types/forms/AdMessageFormData";

interface AdMessageFormTabsProps {
    mode: 'new' | 'edit';
    onSubmit: (data: AdMessageFormData) => void;
    allMarketingCampaigns: IMarketingCampaign[];
    allTemplates: ITemplate[];
    token:string;
    form: ReturnType<typeof useForm<AdMessageFormData>>
}

export function AdMessageFormTabs({
    mode,
    onSubmit,
    allMarketingCampaigns,
    allTemplates,
    token,
    form,
}: AdMessageFormTabsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'email' | 'telegram'>('details');
    const [messageTypes, setMessageTypes] = useState({
        email: false,
        telegram: false,
    })
    const [emailPlaceholderValues, setEmailPlaceholderValues] = useState<Record<string, string>>({});
    const [telegramPlaceholderValues, setTelegramPlaceholderValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const subscription = form.watch((values) => {
            const typeValues = values.type || [];
            setMessageTypes({
                email: typeValues.includes('email'),
                telegram: typeValues.includes('telegram'),
            });
        });

        return () => subscription.unsubscribe();
    }, [form]);

    if(isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'details' | 'email' | 'telegram')} className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-6 rounded-lg border">
                    <TabsTrigger value="details">Message Details</TabsTrigger>
                    <TabsTrigger value="email" disabled={!messageTypes.email}>
                        Email Content
                    </TabsTrigger>
                    <TabsTrigger value="telegram" disabled={!messageTypes.telegram}>
                        Telegram Content
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <DetailsTab
                        form={form}
                        campaigns={allMarketingCampaigns}
                        messageTypes={messageTypes}
                        setMessageTypesAction={setMessageTypes}
                    />
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                    <EmailContentTab
                        form={form}
                        mode={mode}
                        token={token}
                        templates={allTemplates}
                        placeholderValues={emailPlaceholderValues}
                        setPlaceholderValuesAction={setEmailPlaceholderValues} />
                </TabsContent>

                <TabsContent value="telegram" className="space-y-6">
                    <TelegramContentTab
                        form={form}
                        mode={mode}
                        token={token}
                        templates={allTemplates}
                        placeholderValues={telegramPlaceholderValues}
                        setPlaceholderValuesAction={setTelegramPlaceholderValues}
                    />
                </TabsContent>
            </Tabs>
        </form>
    )
}