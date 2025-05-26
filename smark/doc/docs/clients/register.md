---
title: Registering a New Client
sidebar_position: 1
---

# 👤 Registering a New Client

AutoSmark allows you to register new clients with detailed information such as name, contact details, preferences, and subscriptions. This ensures better targeting for marketing campaigns.

On the other hand, AutoSmark also allows users to register themselves through self-service forms.

---

## 📝 Client Information Form

When creating a new client, you must provide the following fields:

### Required Fields

- **First Name** and **Last Name**
- **Email** (must be valid format)
- **Phone** (E.164 international format)
- **Date of Birth** (must be a past date)
- **Preferred Contact Method** (`email` or `telegram`)
- **At least two Preferences** (e.g., "books", "electronics")
- **At least one Subscription** (`email`, `telegram`)

> ⚠️ Validation errors will appear if any required field is missing or incorrect.

---

## 💬 Subscriptions and Preferences

- **Subscriptions** indicate which channels the client agrees to receive content through.
- **Preferences** represent the client's interests and are used to personalize campaigns.

These preferences are key to segmenting your audience effectively.

---

## 🏷️ Automatic Tag Assignment via AI

AutoSmark uses **tags** to group clients by behavior or interests. Instead of assigning tags manually, AutoSmark automatically links tags to each client based on their preferences using **AI**.

### 🔍 How It Works

1. After the client is saved, the system collects:
   - The client’s `name`
   - Their `preferences` (e.g., "fitness", "tech")

2. It compares them with all existing tags and their associated keywords.

3. A **prompt is sent to an AI engine** that returns the most relevant tag IDs.

4. These tags are then assigned to the client record asynchronously (in the background).

> ⚙️ This process is completely automatic and requires no user input.

---

## 🔗 Telegram Chat ID via Webhook

To enable Telegram communication, clients must confirm their identity by sending a `/start` message to the bot.

### 🔄 How it Works

1. When registering the client, leave the `Telegram Chat ID` field empty.
2. The backend generates a temporary `tokenKey` and stores it in the client's record.
3. The system prompts the client to send `/start {tokenKey}` to the Telegram bot.
4. The bot triggers a **webhook** (`/api/telegram/webhook`) with the message.
5. The server:
   - Finds the client by `tokenKey`
   - Updates their `telegram.chatId` with the correct ID
   - Marks the subscription as confirmed (`isConfirmed: true`)
   - Sends a confirmation message back via Telegram

```plaintext
Example command from the client:
👉 /start abcd1234efgh
```

> ✅ Once confirmed, the client can receive Telegram messages from your campaigns.

---

## ✅ After Submission
Once all data is valid:

- The client is saved to the database.

- Tags are automatically assigned in the background via AI.

- A success message appears.

- You are redirected back to the client list.

If any error occurs (e.g., duplicate email, missing fields), a detailed error dialog will appear.

---

## 🧠 Tips
- Always verify that birth dates are realistic (between 1900 and today).

- Use at least two preferences to help the AI assign more accurate tags.

- Make sure Telegram confirmation is completed before scheduling Telegram messages.

- Review assigned tags in the client detail page once created.

Now you're ready to grow your contact base with complete, reliable, and automatically categorized client data!

---