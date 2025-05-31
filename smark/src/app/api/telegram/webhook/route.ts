import { NextRequest, NextResponse } from "next/server";
import { Clients } from "@/models/models";
import connectDB from "@/config/db";
import { sendToTelegram } from "@/lib/utils/telegramSender";

export async function GET(req: NextRequest) {
    return NextResponse.json({ message: "Webhook is working" });
}

export async function POST(req: NextRequest) {
    console.log("POST webhook hit");

    try {
        await connectDB();

        const body = await req.json();
        console.log("Received body:", JSON.stringify(body, null, 2));

        const text = body.message?.text;
        const chatId = body.message?.chat?.id;

        if (!text?.startsWith("/start")) {
            console.log("⏭Not a /start message");
            return NextResponse.json({ message: "Ignored non-start message" }, { status: 200 });
        }

        const tokenKey = text.split(" ")[1];
        console.log("Extracted tokenKey:", tokenKey);

        if (!tokenKey) {
            return NextResponse.json({ error: "Missing tokenKey in /start command" }, { status: 400 });
        }

        const client = await Clients.findOne({ "telegram.tokenKey": tokenKey });

        if (!client) {
            console.warn("No client found for tokenKey:", tokenKey);
            return NextResponse.json({ error: "Invalid tokenKey" }, { status: 404 });
        }

        client.telegram.chatId = String(chatId);
        client.telegram.isConfirmed = true;
        await client.save();

        console.log("Client updated:", client.email || client._id);

        await sendToTelegram(chatId, "You are now subscribed to Telegram notifications!");

        return NextResponse.json({ message: "Client updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


