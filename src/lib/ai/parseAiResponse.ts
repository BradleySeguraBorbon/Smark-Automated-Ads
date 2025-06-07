export function parseAIResponse(fullText: string): any {
  const match = fullText.match(/```json\s*([\s\S]*?)```/);
  const raw = match ? match[1].trim() : fullText.trim();

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const jsonCandidate = raw.slice(start, end + 1);
      return JSON.parse(jsonCandidate);
    }

    throw new Error('Failed to extract valid JSON from AI response');
  }
}
