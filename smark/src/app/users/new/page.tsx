'use client';

import {useAuthStore} from '@/lib/store';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/navigation';
import {Card, CardContent} from '@/components/ui/card';
import UserForm from '@/components/users/UserForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import {decodeToken} from "@/lib/utils/decodeToken";
import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import {IUser} from "@/types/User";

interface CreateUserFormData {
    username: string;
    password: string;
    email: string;
    role?: string;
}

export default function CreateUserPage() {
    const token = useAuthStore((state) => state.token);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertType, setAlertType] = useState<"success" | "error">("success");
    const [alertMessage, setAlertMessage] = useState("");

    const form = useForm<IUser>({
        defaultValues: {
            username: '',
            password: '',
            email: '',
            role: 'employee',
        },
    });

    useEffect(() => {
        if (!token) {
            return;
        }

        async function checkToken() {
            //console.log("Antes de decodeToken");
            const user = await decodeToken(token);
            console.log("User: ", user);
            setUserInfo(user);
        }

        checkToken()
        setLoading(false);
    }, [token, router]);

    const handleSubmit = async (data: CreateUserFormData) => {
        setIsSubmitting(true);
        setApiError(null);

        try {
            const payload = {
                username: data.username,
                password: data.password,
                email: data.email,
                role: userInfo?.role === 'developer' ? data.role : 'employee',
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.message || result.error || 'Failed to create user.';
                setAlertType("error");
                setAlertMessage(errorMessage);
                setAlertOpen(true);
            } else {
                setAlertType("success");
                setAlertMessage("User created successfully!");
                setAlertOpen(true);
                setTimeout(() => {
                    router.push('/users');
                }, 3000);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setAlertType("error");
            setAlertMessage("Unexpected error occurred.");
            setAlertOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner/>
            </div>
        );
    }

    if (userInfo?.role !== 'admin' && userInfo?.role !== 'developer') {
        return (
            <div className="container mx-auto py-10 text-center">
                <p className="text-red-500">You do not have permission to create users.</p>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto py-10 max-w-lg">
                <header>
                    <BreadcrumbHeader backHref="/users" title="Create a New User"/>
                </header>

                <Card>
                    <CardContent>
                        {apiError && (
                            <div className="text-red-500 bg-red-100 p-3 rounded mb-4">{apiError}</div>
                        )}
                        <UserForm
                            form={form}
                            onSubmitAction={handleSubmit}
                            userRole={userInfo?.role || ''}
                            isSubmitting={isSubmitting}
                        />
                    </CardContent>
                </Card>
            </div>
            <CustomAlertDialog
                open={alertOpen}
                type={alertType}
                title={alertType === "success" ? "Success" : "Error"}
                description={alertMessage}
                confirmLabel="OK"
                onConfirm={() => {
                    if(alertType!=='error'){
                        setAlertOpen(false);
                        router.back();
                    }
                }}
                onOpenChange={setAlertOpen}
            />
        </>
    );
}
