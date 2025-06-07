'use client';

import CustomAlertDialog from '@/components/CustomAlertDialog';
import { useEffect } from 'react';

interface Props {
    router: any;
    successOpen: boolean;
    errorOpen: boolean;
    infoOpen: boolean;
    errorMessage: string;
    infoMessage: string;
    setSuccessOpen: (v: boolean) => void;
    setErrorOpen: (v: boolean) => void;
    setInfoOpen: (v: boolean) => void;
}

export default function TagDialogs({
                                       router,
                                       successOpen,
                                       errorOpen,
                                       infoOpen,
                                       errorMessage,
                                       infoMessage,
                                       setSuccessOpen,
                                       setErrorOpen,
                                       setInfoOpen,
                                   }: Props) {
    useEffect(() => {
        if (successOpen) {
            const timeout = setTimeout(() => router.push('/tags'), 3000);
            return () => clearTimeout(timeout);
        }
    }, [successOpen, router]);

    return (
        <>
            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Tag Created Successfully!"
                description="The new tag has been saved into the system."
                confirmLabel="Go to tags"
                onConfirmAction={() => {
                    setSuccessOpen(false);
                    router.push('/tags');
                }}
                onOpenChangeAction={setSuccessOpen}
            />
            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error Creating Tag"
                description={errorMessage}
                confirmLabel="Ok"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
            <CustomAlertDialog
                open={infoOpen}
                type="info"
                title="Attention"
                description={infoMessage}
                confirmLabel="Ok"
                onConfirmAction={() => setInfoOpen(false)}
                onOpenChangeAction={setInfoOpen}
            />
        </>
    );
}
