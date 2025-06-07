export async function assignTags(token: string, notifyGlobal: Function) {
    try {
        const res = await fetch('/api/clients/assignTags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
            notifyGlobal('error', 'Tags could not be assigned automatically');
            return;
        }

        const count = data.updatedClientIds?.length || 0;
        notifyGlobal('success', `Tags assigned to ${count} clients.`);
    } catch {
        notifyGlobal('error', 'Unexpected error during Tags Assignation');
    }
}
