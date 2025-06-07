export function parseJsonFromAiText(text: string): any {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();

    const firstCurly = cleaned.indexOf('{');
    const lastCurly = cleaned.lastIndexOf('}');
    const jsonString = cleaned.slice(firstCurly, lastCurly + 1);

    const parsed = JSON.parse(jsonString);

    return JSON.parse(JSON.stringify(parsed));
  } catch (e: any) {
    console.error('JSON parse failed. Raw input:', text);
    throw new Error('Failed to parse AI response as valid JSON');
  }
}
