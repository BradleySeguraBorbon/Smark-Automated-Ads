---
title: Using Templates and Placeholders
sidebar_position: 1
---

# 🧩 Using Templates and Placeholders

In AutoSmark, **templates** allow you to create reusable message structures for Email and Telegram campaigns. They support dynamic content using **placeholders**, which are replaced with real values at message creation time.

---

## 🧾 What is a Template?

A template is a pre-designed layout written in either:

- **HTML** (for Email messages)
- **Markdown** (for Telegram messages)

Each template may contain **placeholders** such as `{client_name}`, `{discount_code}`, `{product_list}`, etc.

Example:

```html
<h1>Hi `{client_name}`!</h1>
<p>Don't miss our exclusive offer: `{discount_code}`</p>
```

---

## 🧠 What is a Placeholder?
A placeholder is a dynamic variable wrapped in curly braces `{}`. It will be replaced with specific content when the message is created.

- `{client_name}` → "Alice"

- `{discount_code}` → "SAVE20"

- `{event_date}` → "June 5, 2025"

These values can be filled manually or generated using the AI assistant.

---

## ✨ AI Assistant for Placeholders
To help you fill placeholders quickly, AutoSmark includes a built-in AI assistant. You can click "Generate Placeholders" in the message creation form.

### How it works:
1. Select a template and campaign.

2. Enter a message name.

3. Click the "Generate Placeholders" button.

4. The system sends the context to the AI:

- Campaign name, description, tags

- Template structure

5. The AI returns a suggested value for each placeholder and (for Email) a subject line.

You can still edit the values after generation.

---

## 🧪 Placeholder Input and Preview
After selecting a template:

- The system shows all required placeholders as input fields.

- A real-time preview shows how the message will look.

- Email preview supports HTML layout and attachments.

- Telegram preview supports Markdown and button links.

---

## 🔄 Reusing Templates
Templates are fully reusable:

- You can apply the same template to different campaigns or messages.

- Each message gets its own set of placeholder values.

- Updating a template does not retroactively change old messages.

---

## ⚠️ Tips and Best Practices
- Use clear placeholder names: `{client_name}`, not `{x}`.

- Don’t leave any placeholders empty — messages may look broken.

- Test the message previews before scheduling.

- Start building smarter campaigns with personalized, reusable templates today!