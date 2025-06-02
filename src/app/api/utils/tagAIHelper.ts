import {Tags} from "@/models/models";
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
        console.warn('No valid ObjectIds found in AI response:', response);
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
    const tagsString = JSON.stringify(tags.map(tag => ({id: tag._id, keywords: tag.keywords})));
    const prompt = fillPrompt(`Te proporciono la información de un cliente y una lista de tags (cada una con su ID, nombre y keywords).

1. Analiza las preferencias del cliente.
2. Relaciona esas preferencias con las keywords de las tags (busca coincidencias directas o sinónimos).
3. Devuelve SOLO la lista de _id de las tags que mejor coincidan, separados por comas.

NO des explicaciones adicionales ni otro formato!!

Si ninguna tag coincide, devuelve un string vacío.

Cliente:
\${client}

Tags disponibles (array de objetos):
\${tags}
`
        , {client: JSON.stringify(client), tags: tagsString});
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
        throw new Error('Error fetching tags from AI');
    }

    return convertResponseIntoArray(data.response);
}