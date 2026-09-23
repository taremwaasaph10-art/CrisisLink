import { LogIn } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/button';
import { InlineError } from '@/components/error-state';
import { Field, Input } from '@/components/input';
import { homePathFor, useAuth } from '@/context/auth-context';
import { AuthLayout } from '@/layouts/auth-layout';
import { toApiError } from '@/services/api';
import type { ApiError } from '@/services/api';
import type { UserRole } from '@/types';

const DEMO_PASSWORD = 'CrisisLink@2026';

const DEMO_ACCOUNTS: { role: string; email: string }[] = [
    { role: 'Citizen', email: 'citizen@example.com' },
    { role: 'Responder', email: 'responder@example.com' },
    { role: 'Admin', email: 'admin@example.com' },
];

const showDemoAccounts = import.meta.env.VITE_DEMO_ACCOUNTS === 'true';

/** Paths each role may be sent back to after signing in. */
function canReturnTo(path: string, role: UserRole): boolean {
    return role === 'citizen'
        ? !path.startsWith('/responder') && !path.startsWith('/admin')
        : path.startsWith('/responder') ||
              (role === 'admin' && path.startsWith('/admin'));
}

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<ApiError | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const returnTo = (location.state as { from?: string } | null)?.from;

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const user = await login(email, password);
            const destination =
                returnTo && canReturnTo(returnTo, user.role)
                    ? returnTo
                    : homePathFor(user.role);
            void navigate(destination, { replace: true });
        } catch (caught) {
            setError(toApiError(caught));
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Sign in"
            subtitle="Report an emergency or manage the response."
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                <InlineError
                    message={
                        error &&
                        !error.fieldError('email') &&
                        !error.fieldError('password')
                            ? error.message
                            : null
                    }
                />
                <Field label="Email" error={error?.fieldError('email')}>
                    {(props) => (
                        <Input
                            {...props}
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    )}
                </Field>
                <Field label="Password" error={error?.fieldError('password')}>
                    {(props) => (
                        <Input
                            {...props}
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    )}
                </Field>
                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                >
                    {!isSubmitting && <LogIn className="size-5" aria-hidden />}
                    Sign in
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
                New to CrisisLink?{' '}
                <Link
                    to="/register"
                    className="font-semibold text-sos-700 hover:underline"
                >
                    Create an account
                </Link>
            </p>

            {showDemoAccounts && (
                <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Demo accounts
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {DEMO_ACCOUNTS.map((account) => (
                            <button
                                key={account.email}
                                type="button"
                                onClick={() => {
                                    setEmail(account.email);
                                    setPassword(DEMO_PASSWORD);
                                    setError(null);
                                }}
                                className="rounded-lg bg-white px-2 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-300 hover:ring-slate-500"
                            >
                                {account.role}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
