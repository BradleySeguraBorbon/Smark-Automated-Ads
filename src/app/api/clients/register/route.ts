import mongoose from "mongoose";
import {AdMessages, Clients, Tags} from "@/models/models";
import connectDB from "@/config/db";
import {NextResponse} from "next/server";
import {decryptClient, encryptClient} from '@/lib/clientEncryption';
import {getUserFromRequest} from "@/lib/auth";
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

function fillPrompt(template: string, variables: Record<string, string>) {
    return template.replace(/\${(.*?)}/g, (_, key) => {
        const value = variables[key.trim()];
        if (value === undefined) {
            throw new Error(`Missing value for template variable: ${key}`);
        }
        return value;
    });
}

async function validateObjectIdsExist(ids: string[], model: any, fieldName: string) {
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const foundDocs = await model.find({_id: {$in: validIds}}).select('_id');
    const foundIds = new Set(foundDocs.map((doc: any) => doc._id.toString()));
    const invalid = ids.filter(id => !foundIds.has(id));
    return invalid.length === 0 ? null : {field: fieldName, invalidIds: invalid};
}

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

export async function POST(request: Request) {
    await connectDB();

    const result = await sanitizeRequest(request, {
        requiredFields: [
            'firstName', 'lastName', 'email', 'phone', 'preferredContactMethod',
            'subscriptions', 'birthDate'
        ],
        dates: ['birthDate'],
        emails: ['email'],
        enums: [{ field: 'preferredContactMethod', allowed: ['email', 'telegram'] }],
        enumArrays: [{ field: 'subscriptions', allowed: ['email', 'telegram'] }]
    });

    if (!result.ok) return result.response;
    const body = result.data;

    if (!body.email && !body.telegramChatId) {
        return NextResponse.json({
            message: 'Client must have at least one contact method: email or telegramChatId.'
        }, { status: 400 });
    }

    if (body.preferredContactMethod === 'email' && !body.email) {
        return NextResponse.json({
            message: 'Preferred contact method is email, but email is missing.'
        }, { status: 400 });
    }

    if (Array.isArray(body.tags) && body.tags.length > 0) {
        const invalidTags = await validateObjectIdsExist(body.tags, Tags, 'tags');
        if (invalidTags) {
            return NextResponse.json(
                { message: 'Invalid tag references', details: invalidTags },
                { status: 400 }
            );
        }
    }

    if (Array.isArray(body.adInteractions) && body.adInteractions.length > 0) {
        const adMessageIds = body.adInteractions.map((interaction: any) => interaction.adMessage);
        const invalidAdMessages = await validateObjectIdsExist(adMessageIds, AdMessages, 'adInteractions');
        if (invalidAdMessages) {
            return NextResponse.json(
                { message: 'Invalid ad message references', details: invalidAdMessages },
                { status: 400 }
            );
        }
    }

    const encrypted = encryptClient(body);

    try {
        const newClient = await Clients.create(encrypted);

        (async () => {
            const authHeader = request.headers.get('authorization');
            const token = authHeader?.split(' ')[1] || '';

            try {
                const tags = await getTagsIdsBasedOnPreference({
                    name: body.firstName,
                    preferences: body.preferences,
                }, token);

                if (tags && tags.length > 0) {
                    await Clients.findByIdAndUpdate(newClient._id, { tags });
                }
            } catch (err) {
                console.error("Tagging error:", err);
            }

            try {
                if (body.subscriptions?.includes("telegram") && body.email) {
                    const crypto = await import("crypto");
                    const tokenKey = crypto.randomBytes(16).toString("hex");

                    await Clients.findByIdAndUpdate(newClient._id, {
                        telegram: {
                            tokenKey,
                            chatId: null,
                            isConfirmed: false,
                        }
                    });

                    const {sendTelegramInvite} = await import("@/lib/sendTelegramInvite");
                    await sendTelegramInvite(body.email, tokenKey);
                }
            } catch (err) {
                console.error("Telegram invite error:", err);
            }
        })();
        const client = await Clients.findById(newClient._id)
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

        return NextResponse.json(
            { message: 'Client created successfully', result: decryptClient(client) },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || 'Error creating client' },
            { status: error.name === 'ValidationError' ? 422 : 500 }
        );
    }
}