import { encrypt, decrypt } from './crypto';
import { IClient } from '@/types/Client';

export function encryptClient(client: Partial<IClient>): Partial<IClient> {
    const enc = { ...client };

    if (enc.firstName) enc.firstName = encrypt(enc.firstName);
    if (enc.lastName) enc.lastName = encrypt(enc.lastName);
    if (enc.email) enc.email = encrypt(enc.email);
    if (enc.phone) enc.phone = encrypt(enc.phone);
    if (enc.telegramChatId) enc.telegramChatId = encrypt(enc.telegramChatId);
    if (enc.preferredContactMethod) enc.preferredContactMethod = encrypt(enc.preferredContactMethod);
    if (enc.birthDate) enc.birthDate = encrypt(enc.birthDate.toString());
    if (enc.subscriptions) enc.subscriptions = enc.subscriptions.map(encrypt);
    if (enc.preferences) enc.preferences = enc.preferences.map(encrypt);

    return enc;
}

export function decryptClient(client: IClient): IClient {
    const dec = (typeof client.toObject === 'function' ? client.toObject() : { ...client }) as IClient;

    dec.firstName = tryDecrypt(dec.firstName);
    dec.lastName = tryDecrypt(dec.lastName);
    dec.email = tryDecrypt(dec.email);
    dec.phone = tryDecrypt(dec.phone);
    if (dec.telegramChatId) dec.telegramChatId = tryDecrypt(dec.telegramChatId);
    if (dec.preferences) dec.preferences = dec.preferences.map(tryDecrypt);
    if (dec.preferredContactMethod) dec.preferredContactMethod = tryDecrypt(dec.preferredContactMethod);
    if (dec.birthDate && typeof dec.birthDate === 'string') {
        const d = tryDecrypt(dec.birthDate);
        dec.birthDate = (d);
    }
    if (dec.subscriptions) dec.subscriptions = dec.subscriptions.map(tryDecrypt);

    return dec;
}

function tryDecrypt(value: any): any {
    if (typeof value !== 'string') return value;
    try {
        return decrypt(value);
    } catch {
        return value;
    }
}
