---
title: Creating an Ad Message
sidebar_position: 1
---

# Creating an Ad Message

An **Ad Message** is a scheduled promotional message sent to clients via **Email** and/or **Telegram**, linked to a specific marketing campaign. In AutoSmark, you can personalize these messages using dynamic templates and even let AI help you generate the content.

---

## 🧭 Access the Campaign Creation Page

To create a new Ad Message:

1. Navigate to the **Ad Messages** section from the sidebar.
2. Click on the **"New Ad Message"** button.

You will be redirected to a form divided into three main tabs:

---

## 📝 Step 1: Message Details

In the **Details** tab, you must provide the basic information:

- **Message Name**: A descriptive name for internal use.
- **Marketing Campaign**: The campaign this message belongs to.
- **Send Date**: The date when the message will be delivered.
- **Message Types**: Choose between `Email`, `Telegram`, or both using toggles.

> 📅 The send date must be within the start and end dates of the selected campaign.

---

## ✉️ Step 2: Email Content

If **Email** is selected:

1. **Email Subject**: The subject line of the email.
2. **Template Selection**: Choose from predefined HTML templates.
3. **Placeholders**: Templates include `{placeholders}` which must be filled manually or automatically.
4. **Attachments**: Optionally add file names and paths (e.g., `/files/promo.pdf`).
5. **Preview**: See a full email preview before submitting.

---

### 🤖 AI-Assisted Placeholder Filling

Click the **"Generate Placeholders"** button to let the AI assistant:

- Fill in all required placeholder values based on the campaign and message context.
- Generate a subject line if one is not set.

> ✨ This feature is ideal for quickly generating high-quality content.
> 
> 🪄 This is available in telegram and email templates filling.

---

## 💬 Step 3: Telegram Content

If **Telegram** is selected:

1. **Template Selection**: Choose a Markdown-based template.
2. **Placeholders**: Fill them manually or use the **AI assistant**.
3. **Buttons**: Add Telegram buttons with custom text and URLs.
4. **Preview**: Real-time rendered preview of the final message.

---

## ✅ Final Step: Create Message

After filling in all required fields:

- Review the **Message Summary** card on the right.
- Click **“Create Message”** to schedule it.
- A success dialog will confirm the message has been saved.

The system will then send it automatically on the scheduled date to all clients within the campaign audience.

---

## 🕒 Programmed Delivery System

AutoSmark supports **automated sending of Ad Messages** based on their scheduled delivery date.

When a message is created with a `sendDate`, the system stores it as `"programmed"` status. A background process will automatically dispatch all due messages on their delivery date.

### 🔄 How It Works

1. Messages are saved with:
    - `sendDate`: The date when it should be delivered
    - `status`: Initially set to `"programmed"`

2. Every day, the system runs a **scheduled job** (e.g., via cron or serverless function).

3. This job:
    - Checks the database for messages with today's date and `"programmed"` status
    - Sends the message using:
        - `/api/email/sendAds` for email
        - `/api/telegram/sendAds` for Telegram
    - Marks the message as `"sent"` after successful delivery

### 🛠️ Technical Note

The logic runs under the endpoint:

```text
/api/admessages/scheduled-dispatch
```

This endpoint should be invoked daily using:
- A Vercel Cron Job
- A self-hosted cron runner
- Or any serverless scheduler

> ✅ This guarantees your clients receive timely content — without manual intervention.

---

## 🧠 Tips

- Use templates with clear placeholders for personalization.
- Take advantage of the AI feature to speed up message creation.
- Keep messages short and impactful, especially on Telegram.
- Always verify that the `sendDate` falls within the selected campaign's date range.

> Now you're ready to deliver powerful, automated messages with AutoSmark!

---