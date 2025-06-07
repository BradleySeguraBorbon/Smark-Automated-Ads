import * as XLSX from 'xlsx';
import { commaSeparatedToArray } from '@/lib/utils/stringHelper';
import { useAuthStore, useNotificationStore } from '@/lib/store';
import {assignTags} from "@/components/clients/import/assignTags";

export async function handleExcelUpload(file: File) {
    const setLoading = (state: boolean) => {}; // This gets overridden by useState in caller
    setLoading(true);

    const token = useAuthStore.getState().token;
    const notifyGlobal = useNotificationStore.getState().showAlert;

    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const clients = jsonData.map((client: any) => {
            const rawBirthDate = client.birthDate;
            let parsedBirthDate: string | undefined;

            if (typeof rawBirthDate === 'number') {
                const date = XLSX.SSF.parse_date_code(rawBirthDate);
                if (date) {
                    parsedBirthDate = new Date(date.y, date.m - 1, date.d).toISOString();
                }
            } else if (typeof rawBirthDate === 'string') {
                const d = new Date(rawBirthDate);
                if (!isNaN(d.getTime())) parsedBirthDate = d.toISOString();
            }

            return {
                ...client,
                subscriptions: commaSeparatedToArray(client.subscriptions),
                preferences: commaSeparatedToArray(client.preferences),
                birthDate: parsedBirthDate,
            };
        });

        const res = await fetch('/api/clients/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ clients }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to import clients');

        await assignTags(token as string, notifyGlobal);

        return {
            success: true,
            message: result.message + ' Tag assignment will be done in the background.',
            loading: false,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'There was a problem with the clients import',
            loading: false,
        };
    }
}
