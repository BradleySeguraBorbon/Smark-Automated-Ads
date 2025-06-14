import { Tags } from "@/models/models";
import mongoose from "mongoose";

function convertResponseIntoArray(response: string) {
    const cleaned = response
        .replace(/```[\s\S]*?\n/, '')
        .replace(/```/g, '')
        .trim()
        .replace(/^"+|"+$/g, '');

    const ids = cleaned.split(',').map(id => id.trim());
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
        console.warn('No valid ObjectIds found in ai response:', response);
    }
    return validIds;
}

function fillPrompt(template: string, variables: Record<string, string>) {
    return template.replace(/\${(.*?)}/g, (_, key) => {
        const value = variables[key.trim()];
        if (value === undefined) {
            throw new Error(`Missing value for template variable: ${key}`);
        }
        return value;
    });
}

export async function getTagsIdsBasedOnPreference(client: { name: string, preferences: string[] }, token: string) {
    const tags = await Tags.find();
    if (tags.length === 0) {
        throw new Error("No tags found");
    }

    const formattedClient = `Nombre: ${client.name}\nPreferencias: ${client.preferences.join(", ")}`;
    const tagsString = JSON.stringify(tags.map(tag => ({ id: tag._id, keywords: tag.keywords })));

    const prompt = fillPrompt(`
        You are an expert AI in marketing. You will receive the data of a client and a list of tags.

        Each tag contains:
        - an ID
        - a list of related keywords

        Your task is to:
        1. Analyze the client's preferences (topics, interests, likes).
        2. Find direct or semantic matches between those preferences and the keywords of the tags.
        3. Select only the IDs of the tags that best match.

        IMPORTANT:
        - Return ONLY the tag _ids separated by commas.
        - Do NOT include explanations, quotes, JSON format, or line breaks.
        - If no tags match, return an empty string.

        --- Client ---
        ${formattedClient}

        --- Available Tags ---
        ${tags}
        `, {
            client: formattedClient,
            tags: tagsString
        });

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!data.ok) {
        console.log("Data: ", data)
        throw new Error('Error fetching tags from ai');
    }

    return convertResponseIntoArray(data.response);
}