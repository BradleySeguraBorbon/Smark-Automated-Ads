'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import ClientImportForm from './ClientImportForm';

interface Props {
    open: boolean;
    onCloseAction: () => void;
}

export default function ClientImportModal({ open, onCloseAction }: Props) {
    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogTitle className="sr-only">Import Clients</DialogTitle>
            <DialogContent
                className="z-[1000] max-w-xl w-full sm:w-[90%] p-6
             fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             bg-background rounded-xl shadow-xl overflow-y-auto max-h-[90vh]"
            >
                <h2 className="text-lg font-semibold mb-4">Import Clients from Excel</h2>
                <ClientImportForm />
            </DialogContent>
        </Dialog>
    );
}
