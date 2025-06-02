'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ClientImportForm from './ClientImportForm';

interface Props {
    open: boolean;
    onCloseAction: () => void;
}

export default function ClientImportModal({ open, onCloseAction }: Props) {
    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogTitle className="sr-only">Import Clients</DialogTitle>
            <DialogContent className="max-w-xl relative">
                <h2 className="text-lg font-semibold mb-4">Import Clients from Excel</h2>
                <ClientImportForm />
            </DialogContent>
        </Dialog>
    );
}
