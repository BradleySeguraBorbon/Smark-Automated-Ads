export function isValidHtml(html: string): boolean {
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const hasBody = doc.body && doc.body.innerHTML.trim().length > 0
        const hasTags = /<\/?[a-z][\s\S]*>/i.test(html)
        const isNotErrorDoc = !doc.querySelector('parsererror')
        return hasBody && hasTags && isNotErrorDoc
    } catch {
        return false
    }
}