export function commaSeparatedToArray(input: any): string[] {
    if (typeof input !== 'string') return [];
    return input
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}