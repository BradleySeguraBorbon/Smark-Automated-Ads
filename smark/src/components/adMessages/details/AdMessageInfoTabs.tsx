'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailPreview } from '@/components/adMessages/forms/EmailPreview';
import { IAdMessage } from '@/types/AdMessage';
import { Card } from '@/components/ui/card';

interface AdMessageInfoTabsProps {
    adMessage: IAdMessage;
}

export default function AdMessageInfoTabs({ adMessage }: AdMessageInfoTabsProps) {
    const [activeTab, setActiveTab] = useState<'email' | 'telegram'>(
        adMessage.type.includes('email') ? 'email' : 'telegram'
    );

    return (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'telegram')} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6 rounded-lg border">
                <TabsTrigger value="email" disabled={!adMessage.type.includes('email')}>
                    Email
                </TabsTrigger>
                <TabsTrigger value="telegram" disabled={!adMessage.type.includes('telegram')}>
                    Telegram
                </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-6">
                <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Email Preview</h3>
                    <EmailPreview
                        emailData={{
                            subject: adMessage.content.email.subject,
                            body: adMessage.content.email.body,
                            attachments: adMessage.attachments
                        }}
                    />
                </Card>
            </TabsContent>

            <TabsContent value="telegram" className="space-y-6">
                <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Telegram Preview</h3>
                    <div className="bg-gray-100 p-3 rounded-lg max-w-md text-sm whitespace-pre-wrap text-muted-foreground">
                        {adMessage.content.telegram.message}
                        {adMessage.content.telegram.buttons?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {adMessage.content.telegram.buttons.map((btn, index) => (
                                    <div key={index} className="text-blue-600 underline cursor-pointer">
                                        {btn.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
