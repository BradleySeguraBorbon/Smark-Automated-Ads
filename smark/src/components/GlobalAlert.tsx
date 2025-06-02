'use client';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import { useNotificationStore } from '@/lib/store';

export default function GlobalAlert() {
    const { open, type, message, clearAlert } = useNotificationStore();

    return (
        <CustomAlertDialog
            open={open}
            type={type}
            title={type === 'error' ? 'Error' : 'Successful Operation'}
            description={message}
            confirmLabel="Accept"
            onConfirmAction={clearAlert}
            onOpenChangeAction={clearAlert}
        />
    );
}
