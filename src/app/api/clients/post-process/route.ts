import { NextRequest, NextResponse } from "next/server";
import { Clients, Tags } from "@/models/models";
import connectDB from "@/config/db";
import mongoose from "mongoose";


function convertResponseIntoArray(response: string): string[] {
    try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed.tagIds)) {
            const validIds = parsed.tagIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
            if (validIds.length === 0) {
                console.warn('No valid ObjectIds found in ai response:', response);
            }
            return validIds;
        } else {
            console.warn('ai response does not contain tagIds array:', response);
            return [];
        }
    } catch (err) {
        console.warn('Failed to parse ai response as JSON:', response);
        return [];
    }
}

async function getTagsIdsBasedOnPreference(client: { name: string, preferences: string[] }, token: string) {
    const tags = await Tags.find();
    if (tags.length === 0) {
        throw new Error("No tags found");
    }
    const tagsString = JSON.stringify(tags.map(tag => ({id: tag._id, keywords: tag.keywords})));
    const prompt = `
You are an expert marketing assistant AI. Based on the client preferences and the available tags, your task is to identify the most relevant tags by matching the client preferences with the keywords of each tag.

--- Client Information (JSON) ---
${JSON.stringify(client)}

--- Available Tags (Array of objects with _id, name, and keywords) ---
${tagsString}

Instructions:
- Match client preferences with the tags' keywords using direct matches or clear synonyms.
- Return ONLY a valid JSON object with the following structure:

{
  "tagIds": ["id1", "id2", "id3"]
}

- If no tags match, return:
{
  "tagIds": []
}

⚠️ Do NOT include any explanation, markdown, commentary, or other text. Return only the JSON.
`.trim();

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({prompt})
        }
    )

    const data = await response.json();

    if (!data.ok) {
        console.log("Data: ", data)
        throw new Error('Error fetching tags from ai');
    }

    return convertResponseIntoArray(data.response);
}

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const { clientId, email, preferences, subscriptions } = await req.json();
        const token = req.headers.get("authorization")?.split(" ")[1] || "";

        // Tags
        try {
            const tagIds = await getTagsIdsBasedOnPreference({ name: email, preferences }, token);
            if (tagIds.length > 0) await Clients.findByIdAndUpdate(clientId, { tags: tagIds });
        } catch (err) {
            console.error("[POST-PROCESS] Tags error:", err);
        }

        // Telegram
        try {
            if (subscriptions?.includes("telegram") && email) {
                const crypto = await import("crypto");
                const tokenKey = crypto.randomBytes(16).toString("hex");

                await Clients.findByIdAndUpdate(clientId, {
                    telegram: {
                        tokenKey,
                        chatId: null,
                        isConfirmed: false,
                    },
                });

                const { sendTelegramInvite } = await import("@/lib/sendTelegramInvite");
                await sendTelegramInvite(email, tokenKey);
            }
        } catch (err) {
            console.error("[POST-PROCESS] Telegram error:", err);
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Post-processing failed" }, { status: 500 });
    }
}