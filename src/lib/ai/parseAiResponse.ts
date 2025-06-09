export function parseJsonFromAiText(text: string): { segmentId: string; content?: any[] } {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();

    const firstCurly = cleaned.indexOf('{');
    const lastCurly = cleaned.lastIndexOf('}');
    if (firstCurly === -1 || lastCurly === -1) throw new Error('No JSON object found');

    const jsonString = cleaned.slice(firstCurly, lastCurly + 1);
    const parsed = JSON.parse(jsonString);

    if (!parsed.segmentId || typeof parsed.segmentId !== 'string') {
      throw new Error('Missing or invalid segmentId in AI response');
    }

    return parsed;
  } catch (e: any) {
    console.error('JSON parse failed. Raw input:', text);
    throw new Error('Failed to parse AI response as valid segmentId result');
  }
}
