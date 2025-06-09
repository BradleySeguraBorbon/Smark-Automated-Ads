'use client'

import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import { isValidHtml } from '@/lib/utils/validateHtml'

interface Props {
    html: string
}

export default function PreviewContentBox({ html }: Props) {
    const md = new MarkdownIt()
    const rendered = isValidHtml(html) ? html : md.render(html)

    const sanitized = DOMPurify.sanitize(rendered, {
        ALLOWED_ATTR: ['style', 'href', 'target'],
        ALLOWED_TAGS: [
            'a', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'div', 'span',
            'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'b', 'i'
        ]
    })

    return (
        <div className="border rounded-md p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Live Content Preview</p>
            <div
                style={{
                    backgroundColor: '#00786f',
                    color: '#000',
                    padding: '20px',
                    fontFamily: 'Arial, sans-serif',
                    borderRadius: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}
                dangerouslySetInnerHTML={{ __html: sanitized }}
            />
        </div>
    )
}
