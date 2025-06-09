import { NextRequest, NextResponse } from "next/server";
import { Clients, Tags } from "@/models/models";
import connectDB from "@/config/db";
import mongoose from "mongoose";

function convertResponseIntoArray(response: string): string[] {
    try {
        const cleaned = response.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed.tagIds)) {
            return parsed.tagIds.filter((id: string) =>
                mongoose.Types.ObjectId.isValid(id)
            );
        }

        return [];
    } catch (err) {
        console.warn('[POST-PROCESS] Failed to parse AI tag response:', response);
        return [];
    }
}

async function getTagsIdsBasedOnPreference(client: { name: string, preferences: string[] }, token: string) {
    try {
        const tags = await Tags.find();
        if (tags.length === 0) return [];

        const tagsString = JSON.stringify(
            tags.map(tag => ({ id: tag._id, keywords: tag.keywords }))
        );

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
        const res = await fetch(`${apiUrl}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        if (!data.ok) throw new Error("AI response failed");

        return convertResponseIntoArray(data.response);
    } catch (err) {
        console.error("[POST-PROCESS] Tag assignment failed:", err);
        return [];
    }
}

export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const { clientId, email, preferences, subscriptions } = await req.json();
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split(" ")[1] || "";

        // 1. Tag assignment
        try {
            const tagIds = await getTagsIdsBasedOnPreference({ name: email, preferences }, token);
            if (tagIds.length > 0) {
                await Clients.findByIdAndUpdate(clientId, { tags: tagIds });
                console.log(`[POST-PROCESS] Tags assigned to client ${email}`);
            }
        } catch (err) {
            console.error("[POST-PROCESS] Error in tagging:", err);
        }

        // 2. Telegram invite
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
                console.log(`[POST-PROCESS] Telegram invite sent to ${email}`);
            }
        } catch (err) {
            console.error("[POST-PROCESS] Error in telegram invite:", err);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[POST-PROCESS] General error:", error);
        return NextResponse.json({ error: "Failed post-processing" }, { status: 500 });
    }
}
