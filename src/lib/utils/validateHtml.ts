import MarkdownIt from 'markdown-it';

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

export function isValidMarkdown(markdown: string): boolean {
    try {
        const md = new MarkdownIt();
        const result = md.render(markdown);
        return result.trim().length > 0;
    } catch (e) {
        return false;
    }
}