import { encrypt, decrypt } from './crypto';
import { IClient } from '@/types/Client';
import {ClientFormData} from "@/types/forms";

export function encryptClient(client: Partial<ClientFormData>): Partial<ClientFormData> {
    const enc = { ...client };

    if (enc.firstName) enc.firstName = encrypt(enc.firstName);
    if (enc.lastName) enc.lastName = encrypt(enc.lastName);
    if (enc.email) enc.email = encrypt(enc.email);
    if (enc.phone) enc.phone = encrypt(enc.phone);
    if (enc.preferredContactMethod)
        enc.preferredContactMethod = encrypt(enc.preferredContactMethod) as any;
    if (enc.birthDate) (enc as any).birthDate = encrypt(enc.birthDate.toString());
    if (enc.subscriptions) enc.subscriptions = enc.subscriptions.map(encrypt);
    if (enc.preferences) enc.preferences = enc.preferences.map(encrypt);

    return enc;
}

export function decryptClient(client: IClient): IClient {
    const dec: any = JSON.parse(JSON.stringify(client));
    dec._id = client._id;
    if (dec.firstName?.startsWith('enc::')) dec.firstName = tryDecrypt(dec.firstName);
    if (dec.lastName?.startsWith('enc::')) dec.lastName = tryDecrypt(dec.lastName);
    if (dec.email?.startsWith('enc::')) dec.email = tryDecrypt(dec.email);
    if (dec.phone?.startsWith('enc::')) dec.phone = tryDecrypt(dec.phone);

    if (dec.preferredContactMethod?.startsWith('enc::')) {
        const method = tryDecrypt(dec.preferredContactMethod);
        if (method === 'email' || method === 'telegram') {
            dec.preferredContactMethod = method;
        } else {
            dec.preferredContactMethod = undefined;
        }
    }
    if (typeof dec.birthDate === 'string' && dec.birthDate.startsWith('enc::')) {
        const bd = tryDecrypt(dec.birthDate);
        const parsedDate = new Date(bd);
        dec.birthDate = isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    if (Array.isArray(dec.subscriptions)) {
        dec.subscriptions = dec.subscriptions.map((s: string) => s?.startsWith?.('enc::') ? tryDecrypt(s) : s);
    }
    if (Array.isArray(dec.preferences)) {
        dec.preferences = dec.preferences.map((p: string) => p?.startsWith?.('enc::') ? tryDecrypt(p) : p);
    }

    return dec as IClient;
}

const tryDecrypt = (value: any) => {
    if (typeof value !== 'string') return value;
    try {
        return decrypt(value);
    } catch (err) {
        console.warn('Failed to decrypt field:', value);
        return value;
    }
};
