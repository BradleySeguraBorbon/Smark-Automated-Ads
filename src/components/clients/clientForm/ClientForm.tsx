'use client';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormData } from '@/types/forms';

import BasicInfoSection from './BasicInfoSection';
import BirthDatePicker from './BirthDatePicker';
import ContactMethodSection from './ContactMethodSection';
import PreferencesSection from './PreferencesSection';
import SubscriptionsSelector from '@/components/clients/SubscriptionsSelector';

interface ClientFormProps {
    form: UseFormReturn<ClientFormData>;
    onSubmitAction: (data: ClientFormData) => void;
    newPreferenceAction: string;
    setNewPreferenceAction: (value: string) => void;
}

export default function ClientForm({
                                       form,
                                       onSubmitAction,
                                       newPreferenceAction,
                                       setNewPreferenceAction,
                                   }: ClientFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
                <BasicInfoSection form={form} />
                <BirthDatePicker form={form} />
                <ContactMethodSection form={form} />
                <PreferencesSection
                    control={form.control}
                    newPreference={newPreferenceAction}
                    setNewPreferenceAction={setNewPreferenceAction}
                />
                <SubscriptionsSelector control={form.control} />
                <div className="flex justify-end">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-800" variant="secondary">
                        Register
                    </Button>
                </div>
            </form>
        </Form>
    );
}
