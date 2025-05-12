'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AlertType = 'info' | 'error' | 'warning' | 'success';

interface CustomAlertDialogProps {
    open: boolean;
    type: AlertType;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    onOpenChange: (open: boolean) => void;
}

export default function CustomAlertDialog({
    open,
    type,
    title,
    description,
    confirmLabel = 'Accept',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    onOpenChange,
}: CustomAlertDialogProps) {
    const typeClasses = {
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500',
        success: 'text-green-500',
    };

    const actionButtonClasses = {
        error: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        info: 'bg-blue-500 hover:bg-blue-600',
        success: 'bg-green-500 hover:bg-green-600',
    };

    const borderClasses = {
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500',
        success: 'border-green-500',
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={`border-2 ${borderClasses[type]}`}>
                <AlertDialogHeader>
                    <AlertDialogTitle className={typeClasses[type]}>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {type === 'warning' && (
                        <AlertDialogCancel onClick={onCancel}>
                            {cancelLabel}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        className={actionButtonClasses[type]}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
