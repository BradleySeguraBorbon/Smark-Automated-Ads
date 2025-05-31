import { encrypt, decrypt } from './crypto';
import { IClient } from '@/types/Client';

export function encryptClient(client: Partial<IClient>): Partial<IClient> {
    const enc = { ...client };

    if (enc.firstName) enc.firstName = encrypt(enc.firstName);
    if (enc.lastName) enc.lastName = encrypt(enc.lastName);
    if (enc.email) enc.email = encrypt(enc.email);
    if (enc.phone) enc.phone = encrypt(enc.phone);
    if (enc.preferredContactMethod) enc.preferredContactMethod = encrypt(enc.preferredContactMethod);
    if (enc.birthDate) enc.birthDate = encrypt(enc.birthDate.toString());
    if (enc.subscriptions) enc.subscriptions = enc.subscriptions.map(encrypt);
    if (enc.preferences) enc.preferences = enc.preferences.map(encrypt);

    return enc;
}

export function decryptClient(client: IClient): IClient {
    const dec: any = JSON.parse(JSON.stringify(client));
    dec._id = client._id;
console.log("Primer: ", dec);
    if (dec.firstName?.startsWith('enc::')) dec.firstName = tryDecrypt(dec.firstName);
    if (dec.lastName?.startsWith('enc::')) dec.lastName = tryDecrypt(dec.lastName);
    if (dec.email?.startsWith('enc::')) dec.email = tryDecrypt(dec.email);
    if (dec.phone?.startsWith('enc::')) dec.phone = tryDecrypt(dec.phone);
    console.log("Segundo: ", dec);
    if (dec.preferredContactMethod?.startsWith('enc::')) dec.preferredContactMethod = tryDecrypt(dec.preferredContactMethod);
    if (typeof dec.birthDate === 'string' && dec.birthDate.startsWith('enc::')) {
        const bd = tryDecrypt(dec.birthDate);
        dec.birthDate = new Date(bd);
    }

    if (Array.isArray(dec.subscriptions)) {
        dec.subscriptions = dec.subscriptions.map((s: string) => s?.startsWith?.('enc::') ? tryDecrypt(s) : s);
    }
    if (Array.isArray(dec.preferences)) {
        dec.preferences = dec.preferences.map((p: string) => p?.startsWith?.('enc::') ? tryDecrypt(p) : p);
    }
    console.log("Ultimo: ", dec);
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
