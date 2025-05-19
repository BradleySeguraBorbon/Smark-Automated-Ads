import { IUser } from '@/types/User';
import UserCard from './UserCard';

interface UsersListProps {
    users: IUser[];
    currentUserRole?: string;
    currentUserId?: string;
    onDelete: (userId: string) => void;
}

export default function UsersList({ users, currentUserRole, currentUserId, onDelete }: UsersListProps) {
    if (users.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No users found matching your search.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {users.map((user) => (
                <UserCard
                    key={user._id as string}
                    user={user}
                    currentUserRole={currentUserRole as string}
                    currentUserId={currentUserId}
                    onDeleteAction={onDelete}
                />

            ))}
        </div>
    );
}
