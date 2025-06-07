"use client"

import PreferenceManager from "@/components/clients/PreferenceManager";
import { Control } from "react-hook-form";
import { ClientFormData } from "@/types/forms";

interface Props {
    control: Control<ClientFormData>;
    newPreference: string;
    setNewPreferenceAction: (value: string) => void;
}

export default function PreferencesSection({ control, newPreference, setNewPreferenceAction }: Props) {
    return (
        <PreferenceManager
            fieldName="preferences"
            control={control}
            newPreference={newPreference}
            setNewPreferenceAction={setNewPreferenceAction}
        />
    );
}
