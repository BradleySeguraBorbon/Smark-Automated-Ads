import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { messageName, marketingCampaignId, templateId, channel, token } = await req.json()

        if (!messageName || !marketingCampaignId || !templateId || !channel) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const [campaignRes, templateRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/marketingCampaigns/${marketingCampaignId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            }),
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/templates/${templateId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            })
        ])

        if (!campaignRes.ok) return NextResponse.json({ error: 'Invalid campaign' }, { status: 404 })
        if (!templateRes.ok) return NextResponse.json({ error: 'Invalid template' }, { status: 404 })

        const marketingJson = await campaignRes.json()
        const templateJson = await templateRes.json()
        const marketing = marketingJson.result
        const template = templateJson.result

        const safeHtml = template.html || ''
        const safePlaceholders = Array.isArray(template.placeholders) ? template.placeholders.join(', ') : ''

        const prompt = `
You are an expert marketing assistant AI. Based on the information below, generate attractive, engaging and persuasive placeholder content suitable for a ${channel === 'email' ? 'marketing email' : 'Telegram message'} campaign.

Use language that resonates with the target audience and is aligned with the theme of the campaign.

--- Campaign Information ---
Name: ${marketing.name}
Description: ${marketing.description}
Tags: ${Array.isArray(marketing.tags) ? marketing.tags.map((t: any) => t.name).join(', ') : 'None'}

--- Template Information ---
Type: ${template.type}
HTML/Markdown:
${safeHtml}

--- Placeholders ---
${safePlaceholders}

--- Message Name ---
${messageName}

Return ONLY a valid JSON object that maps each placeholder to a suggested value, like this:
{
  "placeholders": {
    "placeholder1": "Value 1",
    "placeholder2": "Value 2"
  }${channel === 'email' ? `,\n  "subject": "Email subject line here"` : ''}
}

Do NOT include any explanations, text outside the JSON, or invalid formatting. The response must be concise, appealing and directly usable in the given template.
        `.trim()

        console.log("Prompt sent to ai:\n", prompt)

        const chatRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        })

        const chatJson = await chatRes.json()
        if (!chatRes.ok || !chatJson.response) {
            throw new Error(chatJson.error || 'ai failed to respond properly')
        }

        let raw = chatJson.response.trim()
        if (raw.startsWith('```json')) {
            raw = raw.replace(/^```json/, '').replace(/```$/, '').trim()
        }

        const parsed = JSON.parse(raw)
        if (!parsed.placeholders) {
            return NextResponse.json({ error: 'No placeholders found in ai response' }, { status: 500 })
        }

        return NextResponse.json(parsed)
    } catch (err: any) {
        console.error('Error analyzing placeholders:', err.message)
        return NextResponse.json({ error: 'Server error during analysis' }, { status: 500 })
    }
}