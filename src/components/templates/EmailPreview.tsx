'use client'

import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import { isValidHtml } from '@/lib/utils/validateHtml'

interface Props {
    html: string
}

export default function EmailPreview({ html }: Props) {
    const md = new MarkdownIt()
    const isHtml = html && isValidHtml(html)
    const renderedHtml = isHtml ? html : md.render(html)

    const sanitizedHtml = DOMPurify.sanitize(renderedHtml, {
        ALLOWED_ATTR: ['style', 'href', 'target'],
        ALLOWED_TAGS: [
            'a', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'div', 'span',
            'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'b', 'i'
        ]
    })

    return (
        <div className="border rounded-md bg-white p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Live Email Preview</p>
            <div
                style={{
                    backgroundColor: '#fff',
                    color: '#000',
                    minHeight: '300px',
                    padding: '20px',
                    fontFamily: 'Arial, sans-serif'
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        </div>
    )
}