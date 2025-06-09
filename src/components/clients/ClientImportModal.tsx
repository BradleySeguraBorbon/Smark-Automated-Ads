'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import ClientImportForm from './ClientImportForm';

interface Props {
    open: boolean;
    onCloseAction: () => void;
    onImportSuccess: (message: string) => void;
}

export default function ClientImportModal({ open, onCloseAction, onImportSuccess }: Props) {
    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogTitle className="sr-only">Import Clients</DialogTitle>
            <DialogContent className="...">
                <h2 className="text-lg font-semibold mb-4">Import Clients from Excel</h2>
                <ClientImportForm onSuccess={onImportSuccess} />
            </DialogContent>
        </Dialog>
    );
}
