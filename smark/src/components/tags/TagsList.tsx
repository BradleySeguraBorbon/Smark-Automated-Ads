import { ITag } from "@/types/Tag"
import TagCard from "@/components/tags/TagCard"

interface TagsListProps {
    tags: ITag[]
    refresh: () => void
    onSuccessDelete?: (msg: string) => void
    currentUserRole:string;
}

export default function TagsList({ tags, refresh, onSuccessDelete, currentUserRole }: TagsListProps) {
    if (tags.length === 0) {
        return <div className="text-center py-10 text-gray-500">No tags found.</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {tags.map(tag => (
                <TagCard key={tag._id as string} tag={tag} refreshAction={refresh} onSuccessDelete={onSuccessDelete} currentUserRole={currentUserRole} />
            ))}
        </div>
    )
}
