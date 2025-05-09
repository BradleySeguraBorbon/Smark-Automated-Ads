'use client';

import {IUser} from "@/types/User";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Trash2, Eye} from "lucide-react";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import {useState} from "react";
import {useAuthStore} from '@/lib/store';
import { useRouter } from 'next/navigation';

interface UserCardProps {
    user: IUser;
    currentUserRole: string;
    currentUserId?: string;
    onDelete: (id: string) => void;
}

export default function UserCard({user, currentUserRole, currentUserId, onDelete}: UserCardProps) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const router = useRouter();
    const [feedbackDialog, setFeedbackDialog] = useState<{
        open: boolean;
        type: 'success' | 'error';
        title: string;
        description: string;
    }>({
        open: false,
        type: 'success',
        title: '',
        description: '',
    });

    const token = useAuthStore((state) => state.token);

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/users/${user._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                setFeedbackDialog({
                    open: true,
                    type: 'error',
                    title: 'Error',
                    description: result.message || result.error || 'Failed to delete user.',
                });
            } else {
                onDelete(user._id as string);
                setFeedbackDialog({
                    open: true,
                    type: 'success',
                    title: 'Success',
                    description: 'User deleted successfully.',
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            setFeedbackDialog({
                open: true,
                type: 'error',
                title: 'Error',
                description: 'Unexpected error occurred while deleting the user.',
            });
        } finally {
            setConfirmDialogOpen(false);
        }
    };

    return (
        <>
            <Card className="relative hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>
                            {user.username}
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        {currentUserRole !== 'employee' && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.push(`/users/${user._id}`)}
                            >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                            </Button>
                        )}

                        {(currentUserRole === 'developer' ||
                                (currentUserRole === 'admin' && user.role === 'employee')) &&
                            user._id !== currentUserId && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setConfirmDialogOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            )}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Role:</span> {user.role}
                        </p>
                        {user.marketingCampaigns.length > 0 && (
                            <p className="text-sm">
                                <span className="font-medium">Marketing Campaigns:</span>{' '}
                                {user.marketingCampaigns.map((mc) => mc._id).join(', ')}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Created At: {new Date(user.createdAt!).toLocaleString()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <CustomAlertDialog
                open={confirmDialogOpen}
                type="warning"
                title="Confirm Deletion"
                description={`Are you sure you want to delete ${user.username}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDialogOpen(false)}
                onOpenChange={setConfirmDialogOpen}
            />

            <CustomAlertDialog
                open={feedbackDialog.open}
                type={feedbackDialog.type}
                title={feedbackDialog.title}
                description={feedbackDialog.description}
                confirmLabel="OK"
                onConfirm={() => setFeedbackDialog({...feedbackDialog, open: false})}
                onOpenChange={(open) => setFeedbackDialog((prev) => ({...prev, open}))}
            />
        </>
    );
}
