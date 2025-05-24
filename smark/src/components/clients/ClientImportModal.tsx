'use client';

import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ClientImportForm from './ClientImportForm';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ClientImportModal({ open, onClose }: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogTitle className="sr-only">Import Clients</DialogTitle>
            <DialogContent className="max-w-xl relative">
                <h2 className="text-lg font-semibold mb-4">Import Clients from Excel</h2>
                <ClientImportForm />
            </DialogContent>
        </Dialog>
    );
}
