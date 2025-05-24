import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const ivLength = 16;

const ENCRYPTION_PREFIX = 'enc::';

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return ENCRYPTION_PREFIX + iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
    const ENCRYPTION_PREFIX = 'enc::';

    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
    if (!encryptedText.startsWith(ENCRYPTION_PREFIX)) return encryptedText;

    const payload = encryptedText.slice(ENCRYPTION_PREFIX.length);
    const [ivHex, encrypted] = payload.split(':');
    if (!ivHex || !encrypted) return encryptedText;

    try {
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        console.warn('Decrypt failed:', err);
        return encryptedText;
    }
}
