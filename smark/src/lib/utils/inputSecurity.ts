import mongoose from 'mongoose';

export function deepSanitize<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map(deepSanitize) as T;
    }
    if (typeof value === 'object' && value !== null) {
        const sanitizedObj: any = {};
        for (const [key, val] of Object.entries(value)) {
            if (!key.startsWith('$')) {
                sanitizedObj[key] = deepSanitize(val);
            }
        }
        return sanitizedObj;
    }
    return value;
}

export function validateRequiredFields(obj: Record<string, any>, required: string[]) {
    return required.filter(field => obj[field] === undefined || obj[field] === null);
}

export function validateObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export function validateDateString(date: string) {
    return !isNaN(Date.parse(date));
}

export function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validateEnum(value: any, allowed: string[]) {
    return allowed.includes(value);
}

export function validateEnumArray(values: any[], allowed: string[]) {
    return Array.isArray(values) && values.every(v => allowed.includes(v));
}
