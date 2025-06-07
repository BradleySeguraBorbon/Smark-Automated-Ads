// components/templates/TemplateHtmlView.tsx
'use client'

import DOMPurify from 'dompurify'

interface Props {
    html: string
}

export default function TemplateHtmlView({ html }: Props) {
    const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_ATTR: ['style', 'href', 'target'],
        ALLOWED_TAGS: [
            'a', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'div', 'span',
            'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'b', 'i'
        ]
    })

    return (
        <div className="border rounded-md bg-white p-4 shadow-sm">
            <p className="text-sm text-muted-foreground mb-2">Rendered Template</p>
            <div
                style={{
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: '20px',
                    fontFamily: 'Arial, sans-serif',
                    borderRadius: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    overflowX: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
        </div>
    )
}
