import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Clients } from "@/models/models";
import crypto from "crypto";
import { sendTelegramInvite } from "@/lib/sendTelegramInvite";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { clients } = await req.json();

        if (!Array.isArray(clients)) {
            return NextResponse.json({ message: "Invalid Format" }, { status: 400 });
        }

        const validClients: any[] = [];
        const seenEmails = new Set();

        for (const rawClient of clients) {
            const {
                firstName,
                lastName,
                email,
                phone,
                preferredContactMethod,
                subscriptions,
                birthDate,
                preferences = [],
                adInteractions = [],
            } = rawClient;

            const requiredFields = [
                firstName,
                lastName,
                email,
                phone,
                preferredContactMethod,
                subscriptions,
                birthDate,
            ];

            if (requiredFields.some(field => field === undefined || field === null)) {
                console.warn(`Skipping client due to missing required fields: ${email}`);
                continue;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                console.warn(`Invalid email format: ${email}`);
                continue;
            }

            if (isNaN(Date.parse(birthDate))) {
                console.warn(`Invalid birthDate format: ${birthDate}`);
                continue;
            }

            if (seenEmails.has(email)) {
                console.warn(`Duplicate in upload skipped: ${email}`);
                continue;
            }

            const alreadyExists = await Clients.findOne({email});

            if (alreadyExists) {
                console.warn(`Duplicate in DB skipped: ${email}`);
                continue;
            }

            seenEmails.add(email);


            let telegram: any = undefined;
            if (subscriptions?.includes("telegram")) {
                const tokenKey = crypto.randomBytes(16).toString("hex");
                telegram = {
                    tokenKey,
                    chatId: null,
                    isConfirmed: false,
                };
            }

            const clientData = {
                firstName,
                lastName,
                email,
                phone,
                preferredContactMethod,
                subscriptions,
                birthDate,
                preferences,
                adInteractions,
                tags: [],
                tagsPending: true,
                ...(telegram && { telegram })
            };

            const sanitized = Object.fromEntries(
                Object.entries(clientData).filter(([key, value]) =>
                    !(key === "telegramChatId" && (value == null || value === ""))
                )
            );

            validClients.push(sanitized);
        }

        if (validClients.length === 0) {
            return NextResponse.json({ message: "No valid clients to import." }, { status: 400 });
        }

        const inserted = await Clients.insertMany(validClients, { ordered: false });

        return NextResponse.json({
            message: `${inserted.length} clients were imported successfully.`,
            clients: inserted,
        });
    } catch (error) {
        console.error("Error en importación masiva:", error);
        return NextResponse.json({ message: "Error al importar datos." }, { status: 500 });
    }
}
