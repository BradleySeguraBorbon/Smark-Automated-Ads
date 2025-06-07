---
title: Creating a New Template
sidebar_position: 2
---

# ✍️ Creating a New Template

Templates in AutoSmark allow you to define reusable message structures for **email** or **Telegram** communications. Each template includes content and dynamic **placeholders** that will be filled when creating actual messages.

---

## 📝 Step-by-Step: Create a Template

To create a new template, go to the **Templates** section and click **“Create New Template”**. You'll be asked to provide the following:

---

### 🔤 Template Name

A descriptive name to identify the template. For example:

```text
Welcome Email
Promo Blast - Summer
Telegram Giveaway Message
```

---

## 📩 Template Type
Select the type of message this template is for:

- Email – uses full HTML structure with support for formatting, images, links, and styling.

- Telegram – uses Markdown formatting and includes support for interactive buttons.

> ⚠️ This type cannot be changed later, so make sure you select the correct one.

---

## 🧾 Content (HTML or Markdown)
Depending on the type:

- Email Templates require valid HTML

- Telegram Templates support Markdown

You can write the message body here. It should include dynamic placeholders like `{client_name}`, `{discount_code}`, etc.

**Example Email Template (HTML)**
```markdown
<h1>Hello {client_name}!</h1>
<p>Your special discount is: <strong>{discount_code}</strong></p>
```
**Example Telegram Template (Markdown)**
```markdown
🎉 Hello {client_name}!

Use this code to get 20% off: *{discount_code}*

[Shop Now](https://example.com)
```
> The system automatically renders a live preview beside the editor so you can see how your message will look.

---

## 🧩 Placeholders
Manually define each `{placeholder}` used in the content. This lets AutoSmark know which values should be filled later during message creation.

For example, if your content contains `{client_name}` and `{discount_code}`, you must list them in the Placeholders section.

You can add placeholders by typing and clicking “Add”, or pressing Enter.

---

## ✅ Submitting the Template
Once all fields are valid:

- Click “Create Template”

- The template will be saved and available to use in AdMessages

- You’ll be redirected back to the Templates list

If there are any errors (e.g., invalid HTML or missing placeholders), they will be shown in a dialog.

---

🧠 Best Practices
- Use meaningful placeholder names like `{event_date}`, `{client_name}`, `{product_list}`.

- For email templates, test your HTML in multiple clients if using advanced formatting.

- Keep Telegram templates concise and clear.

Now you're ready to create dynamic, professional-looking templates for smart and personalized campaigns!

---