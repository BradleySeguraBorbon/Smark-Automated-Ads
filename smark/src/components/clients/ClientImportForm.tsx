'use client';

import {useState} from 'react';
import * as XLSX from 'xlsx';
import { commaSeparatedToArray } from '@/lib/utils/stringHelper';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import { useAuthStore } from '@/lib/store';
import { useNotificationStore } from '@/lib/store';

export default function ClientImportForm() {
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const token = useAuthStore.getState().token;
    const notifyGlobal = useNotificationStore.getState().showAlert;

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
                const rawBirthDate = client.birthDate;
                let parsedBirthDate: string | undefined = undefined;

                if (typeof rawBirthDate === 'number') {
                    const excelDate = XLSX.SSF.parse_date_code(rawBirthDate);
                    if (excelDate) {
                        const jsDate = new Date(
                            excelDate.y,
                            excelDate.m - 1,
                            excelDate.d
                        );
                        parsedBirthDate = jsDate.toISOString();
                    }
                } else if (typeof rawBirthDate === 'string') {
                    const date = new Date(rawBirthDate);
                    if (!isNaN(date.getTime())) {
                        parsedBirthDate = date.toISOString();
                    }
                }

                const cleaned = {
                    ...client,
                    subscriptions: commaSeparatedToArray(client.subscriptions),
                    preferences: commaSeparatedToArray(client.preferences),
                    birthDate: parsedBirthDate
                };
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

            if (!response.ok) {
                setLoading(false);
                throw new Error(result.message || 'Failed to import clients');
            }

            setSuccessMessage(result.message + " Tag assignment will be done in the background.");
            setSuccessOpen(true);
            setLoading(false);

            try {
                const assignResponse = await fetch('/api/clients/assignTags', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ token }),
                });

                let assignResult: any;
                try {
                    assignResult = await assignResponse.json();
                } catch {
                    assignResult = {};
                }

                if (!assignResponse.ok) {
                    console.error('Tag assignment failed:', assignResult.message);
                    notifyGlobal('error', 'Tags could not be assigned automatically');
                } else {
                    notifyGlobal('success', `Tags assigned to ${assignResult.updatedClientIds.length} clients.`);
                }
            } catch (tagError) {
                console.error('Error in background tag assignment:', tagError);
                notifyGlobal('error', 'Unexpected error during Tags Assignation');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'There was a problem with the clients import');
            setErrorOpen(true);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium pb-5">Upload Excel File</label>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={loading}
                className="block w-full text-sm file:bg-emerald-600 hover:file:bg-emerald-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white"
            />
            {loading && <p className="text-sm text-muted-foreground">Processing file...</p>}

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Importación exitosa"
                description={successMessage}
                confirmLabel="Aceptar"
                onConfirmAction={() => setSuccessOpen(false)}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error al importar"
                description={errorMessage}
                confirmLabel="Cerrar"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </div>
    );
}
