import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Clients } from "@/models/models";
import { getTagsIdsBasedOnPreference } from "@/app/api/utils/tagAIHelper";
import pLimit from "p-limit";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { clients } = await req.json();

        if (!Array.isArray(clients)) {
            return NextResponse.json({ message: "Invalid Format" }, { status: 400 });
        }

        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split(" ")[1] || "";
        const limit = pLimit(10);

        const processedClients = await Promise.all(
            clients.map((rawClient) =>
                limit(async () => {
                    const {
                        firstName,
                        lastName,
                        email,
                        phone,
                        telegramChatId,
                        preferredContactMethod,
                        subscriptions,
                        birthDate,
                        preferences = [],
                        adInteractions = [],
                    } = rawClient;

                    const requiredFields = [
                        firstName,
                        lastName,
                        email,
                        phone,
                        preferredContactMethod,
                        subscriptions,
                        birthDate,
                    ];
                    if (requiredFields.some((field) => field === undefined || field === null)) {
                        console.warn(`Skipping client due to missing required fields: ${email}`);
                        return null;
                    }

                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        console.warn(`Invalid email format: ${email}`);
                        return null;
                    }

                    if (isNaN(Date.parse(birthDate))) {
                        console.warn(`Invalid birthDate format: ${birthDate}`);
                        return null;
                    }

                    const existing = await Clients.findOne({
                        $or: [{ email }, { telegramChatId }],
                    });
                    if (existing) {
                        console.warn(`Duplicate client skipped: ${email}`);
                        return null;
                    }

                    let clientTags: string[] = [];
                    if (preferences.length > 0) {
                        try {
                            clientTags = await getTagsIdsBasedOnPreference(
                                { name: firstName, preferences },
                                token
                            );
                        } catch (err) {
                            console.warn(`Tag AI error for ${email}:`, err);
                        }
                    }

                    return {
                        firstName,
                        lastName,
                        email,
                        phone,
                        telegramChatId,
                        preferredContactMethod,
                        subscriptions,
                        birthDate,
                        preferences,
                        tags: clientTags,
                        adInteractions,
                    };
                })
            )
        );

        const validClients = processedClients.filter((client) => client !== null);

        if (validClients.length === 0) {
            return NextResponse.json({ message: "No clients were imported." }, { status: 400 });
        }

        const inserted = await Clients.insertMany(validClients);

        return NextResponse.json({
            message: `${inserted.length} clients were imported successfully.`,
            clients: inserted,
        });
    } catch (error) {
        console.error("Error en importación masiva:", error);
        return NextResponse.json({ message: "Error al importar datos." }, { status: 500 });
    }
}
