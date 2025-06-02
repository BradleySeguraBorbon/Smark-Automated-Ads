---
title: Importing Clients from Excel
sidebar_position: 2
---

# 📥 Importing Clients from Excel

AutoSmark allows you to import multiple clients at once from an Excel file. This is a fast and efficient way to populate your database before launching marketing campaigns.

---

## 📄 File Format Requirements

Your Excel file should contain a single sheet with the following **required columns**:

| Column             | Required | Format                         |
|--------------------|----------|--------------------------------|
| `firstName`        | ✅        | Text (e.g., "Alice")           |
| `lastName`         | ✅        | Text (e.g., "Smith")           |
| `email`            | ✅        | Valid email format             |
| `phone`            | ✅        | E.164 format recommended       |
| `birthDate`        | ✅        | Date or Excel date format      |
| `preferredContactMethod` | ✅  | `"email"` or `"telegram"`     |
| `subscriptions`    | ✅        | Comma-separated list (`email,telegram`) |
| `preferences`      | ✅        | Comma-separated list (`books,travel`)   |

---

## 🧠 Automatic Validation

During the import process, the system will:

- Skip rows with **missing or invalid required fields**
- Ignore **duplicate emails** (within the file or already in the database)
- Convert **birth dates** from Excel format to ISO date
- Convert `preferences` and `subscriptions` to arrays
- Generate a **Telegram invite token** if `telegram` is in the subscriptions
- Mark the client with `tagsPending: true` for post-processing

---

## ✅ Importing the File

1. Go to the **Clients** page.
2. Click on **“Import Clients”**.
3. Select your `.xlsx` or `.xls` file.
4. The system will upload and validate the file.
5. You’ll receive a success or error message depending on the result.

If the import is successful, clients are immediately added to your database.

---

## 🏷️ Asynchronous Tag Assignment

After the clients are imported:

- The system triggers a **background process** to assign tags based on each client’s preferences.
- This uses AI logic to find relevant tags.
- Tags are assigned automatically and `tagsPending` is set to `false`.

> You will see a notification like:  
> _“Tags assigned to 14 clients.”_

---

## 💬 Telegram Integration

If a client has `"telegram"` in their subscriptions:

- A unique `tokenKey` is generated for them.
- The system sends an invite message via the Telegram bot using `/start {tokenKey}`.
- When the client responds, the webhook will link their `chatId`.

---

## 🧠 Tips

- Always double-check column names and data types.
- You can preview Excel sheets using free tools like Google Sheets or Excel Online.
- Use plain column headers without spaces or special characters.
- Ensure each row has at least **two preferences** to improve tag accuracy.

---

Bulk imports save time and allow you to onboard hundreds of clients efficiently — make sure your file is clean and structured before uploading!
