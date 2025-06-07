'use client';

import { useState } from 'react';
import { handleExcelUpload } from './import/handleExcelUpload';
import CustomAlertDialog from '@/components/CustomAlertDialog';

export default function ClientImportForm() {
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await handleExcelUpload(file);
        setLoading(result.loading);

        if (result.success) {
            setSuccessMessage(result.message);
            setSuccessOpen(true);
        } else {
            setErrorMessage(result.message);
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
                title="Import successful"
                description={successMessage}
                confirmLabel="Accept"
                onConfirmAction={() => setSuccessOpen(false)}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Import failed"
                description={errorMessage}
                confirmLabel="Close"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </div>
    );
}
