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
    const tagsString = JSON.stringify(tags.map(tag => ({ id: tag._id, keywords: tag.keywords })));
    const prompt = fillPrompt(`
        Eres una IA experta en marketing. Recibirás los datos de un cliente y una lista de tags. 

        Cada tag contiene:
        - un ID
        - una lista de palabras clave relacionadas

        Tu tarea es:
        1. Analizar las preferencias del cliente (temas, intereses, gustos).
        2. Buscar coincidencias directas o semánticas entre estas preferencias y las palabras clave de las tags.
        3. Seleccionar solo los IDs de las tags que mejor coincidan.

        IMPORTANTE:
        - Devuelve SOLO los _id de las tags separados por comas.
        - No incluyas explicaciones, ni comillas, ni formato JSON, ni saltos de línea.
        - Si no hay coincidencias, devuelve un string vacío.

        --- Cliente ---
        ${client}

        --- Tags disponibles ---
        ${tags}
        `, {
            client: JSON.stringify(client),
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
    }
    )

    const data = await response.json();

    if (!data.ok) {
        console.log("Data: ", data)
        throw new Error('Error fetching tags from ai');
    }

    return convertResponseIntoArray(data.response);
}