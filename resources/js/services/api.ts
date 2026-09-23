/**
 * Thin fetch wrapper for the CrisisLink REST API.
 *
 * Every response uses the `{ success, message, data }` envelope. Failures are
 * thrown as `ApiError` carrying the server's message and validation errors.
 */

const TOKEN_KEY = 'crisislink.token';

export type ApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
};

export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
    readonly status: number;
    readonly errors: ValidationErrors;

    constructor(
        message: string,
        status: number,
        errors: ValidationErrors = {},
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }

    /** First validation message for a field, if any. */
    fieldError(field: string): string | undefined {
        return this.errors[field]?.[0];
    }
}

export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    return new ApiError('Something went wrong. Please try again.', 0);
}

function readToken(storage: 'localStorage' | 'sessionStorage'): string | null {
    try {
        return window[storage].getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

function writeToken(
    storage: 'localStorage' | 'sessionStorage',
    token: string | null,
): void {
    try {
        if (token === null) {
            window[storage].removeItem(TOKEN_KEY);
        } else {
            window[storage].setItem(TOKEN_KEY, token);
        }
    } catch {
        // Storage can be unavailable (private mode); the session then lasts until reload.
    }
}

/**
 * Each tab keeps its own sign-in (sessionStorage survives reloads of that
 * tab), while localStorage lets a newly opened tab pick up the latest one.
 * A citizen window and a responder window side by side therefore never
 * swap identities, which matters when demoing both on one machine.
 */
let currentToken: string | null =
    readToken('sessionStorage') ?? readToken('localStorage');

writeToken('sessionStorage', currentToken);

export const tokenStore = {
    get(): string | null {
        return currentToken;
    },
    set(token: string): void {
        currentToken = token;
        writeToken('sessionStorage', token);
        writeToken('localStorage', token);
    },
    clear(): void {
        // Leave another tab's newer sign-in in place for future tabs.
        if (readToken('localStorage') === currentToken) {
            writeToken('localStorage', null);
        }

        writeToken('sessionStorage', null);
        currentToken = null;
    },
};

let unauthorizedHandler: (() => void) | null = null;

/** Called whenever the API rejects the token, so the app can sign the user out. */
export function onUnauthorized(handler: (() => void) | null): void {
    unauthorizedHandler = handler;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
    method: Method,
    path: string,
    body?: unknown,
): Promise<ApiEnvelope<T>> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = tokenStore.get();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let payload: BodyInit | undefined;

    if (body instanceof FormData) {
        payload = body;
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }

    let response: Response;

    try {
        response = await fetch(`/api${path}`, {
            method,
            headers,
            body: payload,
        });
    } catch {
        throw new ApiError(
            'Unable to reach CrisisLink. Check your connection and try again.',
            0,
        );
    }

    const json = (await response.json().catch(() => null)) as
        | (ApiEnvelope<T> & { errors?: ValidationErrors })
        | null;

    if (!response.ok) {
        if (response.status === 401 && token) {
            unauthorizedHandler?.();
        }

        throw new ApiError(
            json?.message || 'Something went wrong. Please try again.',
            response.status,
            json?.errors ?? {},
        );
    }

    return json as ApiEnvelope<T>;
}

export const api = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
};

/** Build a query string, skipping empty values. */
export function queryString(
    params: Record<string, string | number | null | undefined>,
): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            search.set(key, String(value));
        }
    });

    const query = search.toString();

    return query ? `?${query}` : '';
}
