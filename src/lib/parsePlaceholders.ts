
export function extractPlaceholderValues(templateHtml: string, finalHtml: string): Record<string, string> {
    const result: Record<string, string> = {};
    const regex = /{(\w+?)}/g;

    let templateParts = [];
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(templateHtml)) !== null) {
        const before = templateHtml.slice(lastIndex, match.index);
        templateParts.push({ key: match[1], before });
        lastIndex = regex.lastIndex;
    }

    templateParts.push({ key: null, before: templateHtml.slice(lastIndex) });

    let currentIndex = 0;
    for (let i = 0; i < templateParts.length - 1; i++) {
        const { key, before } = templateParts[i];
        const nextStatic = templateParts[i + 1].before;

        const start = finalHtml.indexOf(before, currentIndex) + before.length;
        const end = finalHtml.indexOf(nextStatic, start);

        const value = finalHtml.slice(start, end);
        result[key!] = value;
        currentIndex = end;
    }

    return result;
}
