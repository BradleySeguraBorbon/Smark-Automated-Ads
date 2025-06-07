export function parseAIResponse(text: string) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  const rawJson = jsonMatch ? jsonMatch[1].trim() : text.trim();

  const cleanJson = rawJson
    .replace(/^[^\{]*?/, '') 
    .replace(/[\s\S]*?({[\s\S]*})[\s\S]*/, '$1'); 

  try {
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('JSON parse failed. Raw input:', cleanJson);
    throw new Error('Failed to parse AI response as valid JSON');
  }
}
