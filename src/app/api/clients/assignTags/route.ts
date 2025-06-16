import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Clients from '@/models/Client';
import { getTagsIdsBasedOnPreference } from '@/app/api/utils/tagAIHelper';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { token } = await req.json();

        const pendingClients = await Clients.find({ tagsPending: true }).lean(); 

        const updatedClients: string[] = [];

        for (const client of pendingClients) {
            try {
                const tagIds = await getTagsIdsBasedOnPreference(
                    { name: client.firstName, preferences: client.preferences },
                    token
                );

                await Clients.findByIdAndUpdate(client._id, {
                    $set: {
                        tags: tagIds, 
                        tagsPending: false,
                    },
                });

                updatedClients.push(client._id.toString());
            } catch (err) {
                console.error(`Error assigning tags to client ${client.email}:`, err);
            }
        }

        return NextResponse.json({
            message: `Tags assigned to ${updatedClients.length} clients.`,
            updatedClientIds: updatedClients,
        });
    } catch (err) {
        console.error('Error assigning tags in batch:', err);
        return NextResponse.json({ message: 'Batch tag assignment failed.' }, { status: 500 });
    }
}
