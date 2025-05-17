'use client';

import {useState} from 'react';
import * as XLSX from 'xlsx';
import { commaSeparatedToArray } from '@/lib/utils/stringHelper';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import {useAuthStore} from '@/lib/store';

export default function ClientImportForm() {
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const token = useAuthStore.getState().token;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {type: 'array'});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const cleanedClients = jsonData.map((client: any) => {
                const cleaned = {
                    ...client,
                    subscriptions: commaSeparatedToArray(client.subscriptions),
                    preferences: commaSeparatedToArray(client.preferences),
                };
                if (cleaned.telegramChatId == null || cleaned.telegramChatId === "") {
                    delete cleaned.telegramChatId;
                }
                return cleaned;
            });

            const response = await fetch('/api/clients/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({clients: cleanedClients }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Failed to import clients');

            setSuccessMessage(result.message);
            setSuccessOpen(true);
        } catch (err: any) {
            setErrorMessage(err.message || 'There was a problem with the import');
            setErrorOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium">Upload Excel File</label>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={loading}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
            />
            {loading && <p className="text-sm text-muted-foreground">Processing file...</p>}

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Importación exitosa"
                description={successMessage}
                confirmLabel="Aceptar"
                onConfirm={() => setSuccessOpen(false)}
                onOpenChange={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error al importar"
                description={errorMessage}
                confirmLabel="Cerrar"
                onConfirm={() => setErrorOpen(false)}
                onOpenChange={setErrorOpen}
            />
        </div>
    );
}
