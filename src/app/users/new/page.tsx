'use client'

import {useRouter} from 'next/navigation'
import {useForm} from 'react-hook-form'
import {useState} from 'react'
import {useAuthStore} from '@/lib/store'
import {Card, CardContent} from '@/components/ui/card'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import {Form} from '@/components/ui/form'
import {Button} from '@/components/ui/button'
import UserBasicFields from '@/components/users/UserBasicFields'
import UserContactFields from '@/components/users/UserContactFields'
import {UserFormData} from '@/types/forms'

export default function CreateUserPage() {
    const router = useRouter()
    const token = useAuthStore((s) => s.token)
    const userRole = useAuthStore((s) => s.user?.role || '')

    type AlertType = 'info' | 'error' | 'warning' | 'success'
    const [dialog, setDialog] = useState<{ open: boolean, type: AlertType, message: string }>
    ({open: false, type: 'success', message: ''})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<UserFormData>({
        defaultValues: {
            username: '',
            password: '',
            email: '',
            role: 'employee'
        }
    })

    const onSubmit = async (data: UserFormData) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...data,
                role: userRole === 'developer' ? data.role : 'employee'
            }

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (!res.ok) {
                setDialog({
                    open: true,
                    type: 'error',
                    message: result.message || result.error || 'Failed to create user.'
                })
                return
            }
            setDialog({open: true, type: 'success', message: 'User created successfully!'})
            setTimeout(() => router.push('/users'), 3000)
        } catch {
            setDialog({open: true, type: 'error', message: 'Unexpected error occurred.'})
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-lg">
            <BreadcrumbHeader backHref="/users" title="Create a New User"/>
            <Card>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <UserBasicFields form={form}/>
                            <UserContactFields form={form} userRole={userRole}/>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <CustomAlertDialog
                open={dialog.open}
                type={dialog.type}
                title={dialog.type === 'success' ? 'Success' : 'Error'}
                description={dialog.message}
                confirmLabel="OK"
                onConfirmAction={() => setDialog({...dialog, open: false})}
                onOpenChangeAction={(open) => !open && setDialog({...dialog, open: false})}
            />
        </div>
    )
}