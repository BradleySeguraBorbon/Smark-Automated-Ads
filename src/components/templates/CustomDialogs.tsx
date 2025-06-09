'use client'

import CustomAlertDialog from '@/components/CustomAlertDialog'

interface Props {
    successOpen: boolean
    setSuccessOpen: (v: boolean) => void
    errorOpen: boolean
    setErrorOpen: (v: boolean) => void
    errorMessage: string
    onSuccess: () => void
}

export default function CustomDialogs({
                                          successOpen,
                                          setSuccessOpen,
                                          errorOpen,
                                          setErrorOpen,
                                          errorMessage,
                                          onSuccess
                                      }: Props) {
    return (
        <>
            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Template Updated"
                description="Changes saved successfully."
                confirmLabel="Go to Templates"
                onConfirmAction={onSuccess}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Update Error"
                description={errorMessage}
                confirmLabel="OK"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </>
    )
}
