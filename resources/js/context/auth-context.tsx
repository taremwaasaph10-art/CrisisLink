import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { onUnauthorized, tokenStore } from '@/services/api';
import { authService } from '@/services/auth';
import type { RegisterPayload } from '@/services/auth';
import type { User, UserRole } from '@/types';

type AuthContextValue = {
    user: User | null;
    /** True until the stored token has been checked on first load. */
    isBooting: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (payload: RegisterPayload) => Promise<User>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isBooting, setIsBooting] = useState(() => tokenStore.get() !== null);

    useEffect(() => {
        onUnauthorized(() => {
            tokenStore.clear();
            setUser(null);
        });

        if (tokenStore.get() === null) {
            return () => onUnauthorized(null);
        }

        authService
            .me()
            .then(setUser)
            .catch(() => tokenStore.clear())
            .finally(() => setIsBooting(false));

        return () => onUnauthorized(null);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { token, user: signedIn } = await authService.login(
            email,
            password,
        );
        tokenStore.set(token);
        setUser(signedIn);

        return signedIn;
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        const { token, user: created } = await authService.register(payload);
        tokenStore.set(token);
        setUser(created);

        return created;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            tokenStore.clear();
            setUser(null);
        }
    }, []);

    return (
        <AuthContext value={{ user, isBooting, login, register, logout }}>
            {children}
        </AuthContext>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth must be used inside <AuthProvider>.');
    }

    return context;
}

/** Where each role lands after signing in. */
export function homePathFor(role: UserRole): string {
    return role === 'citizen' ? '/home' : '/responder/dashboard';
}
