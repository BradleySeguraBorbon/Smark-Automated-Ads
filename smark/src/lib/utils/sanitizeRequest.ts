import { NextResponse } from 'next/server';
import {
    deepSanitize,
    validateRequiredFields,
    validateDateString,
    validateEmail,
    validateEnum,
    validateEnumArray
} from './inputSecurity';

type ValidateOptions = {
    requiredFields?: string[];
    emails?: string[]; // campos que deben ser emails
    dates?: string[];  // campos que deben ser fechas válidas
    enums?: { field: string; allowed: string[] }[]; // campos que deben pertenecer a una lista
    enumArrays?: { field: string; allowed: string[] }[]; // arrays con valores válidos
};

export async function sanitizeRequest<T = any>(
    request: Request,
    options: ValidateOptions = {}
): Promise<
    | { ok: true; data: T }
    | { ok: false; response: ReturnType<typeof NextResponse.json> }
> {
    try {
        const raw = await request.json();
        const body = deepSanitize(raw) as T;

        if (options.requiredFields) {
            const missing = validateRequiredFields(body as Record<string, any>, options.requiredFields);
            if (missing.length > 0) {
                return {
                    ok: false,
                    response: NextResponse.json(
                        { error: 'Missing required fields', missing },
                        { status: 400 }
                    ),
                };
            }
        }

        // Validar emails
        if (options.emails) {
            for (const field of options.emails) {
                const value = (body as any)[field];
                if (value && typeof value === 'string' && !validateEmail(value)) {
                    return {
                        ok: false,
                        response: NextResponse.json(
                            { error: `Invalid email format in field '${field}'` },
                            { status: 400 }
                        ),
                    };
                }
            }
        }

        // Validar fechas
        if (options.dates) {
            for (const field of options.dates) {
                const value = (body as any)[field];
                if (value && typeof value === 'string' && !validateDateString(value)) {
                    return {
                        ok: false,
                        response: NextResponse.json(
                            { error: `Invalid date format in field '${field}'` },
                            { status: 400 }
                        ),
                    };
                }
            }
        }

        // Validar enums
        if (options.enums) {
            for (const { field, allowed } of options.enums) {
                const value = (body as any)[field];
                if (value && !validateEnum(value, allowed)) {
                    return {
                        ok: false,
                        response: NextResponse.json(
                            { error: `Invalid value for '${field}'. Must be one of: ${allowed.join(', ')}` },
                            { status: 400 }
                        ),
                    };
                }
            }
        }

        // Validar enum arrays
        if (options.enumArrays) {
            for (const { field, allowed } of options.enumArrays) {
                const value = (body as any)[field];
                if (!validateEnumArray(value, allowed)) {
                    return {
                        ok: false,
                        response: NextResponse.json(
                            { error: `Invalid array values for '${field}'. Allowed: ${allowed.join(', ')}` },
                            { status: 400 }
                        ),
                    };
                }
            }
        }

        return { ok: true, data: body };
    } catch {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Invalid JSON format' },
                { status: 400 }
            ),
        };
    }
}
