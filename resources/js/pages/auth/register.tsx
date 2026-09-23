import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/button';
import { InlineError } from '@/components/error-state';
import { Field, Input } from '@/components/input';
import { useAuth } from '@/context/auth-context';
import { AuthLayout } from '@/layouts/auth-layout';
import { toApiError } from '@/services/api';
import type { ApiError } from '@/services/api';

/** Citizen sign-up. Responder accounts are created by an administrator. */
export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState<ApiError | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const update = (field: keyof typeof form) => (value: string) =>
        setForm((current) => ({ ...current, [field]: value }));

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await register({ ...form, phone: form.phone || undefined });
            void navigate('/home', { replace: true });
        } catch (caught) {
            setError(toApiError(caught));
            setIsSubmitting(false);
        }
    };

    const fields: {
        name: keyof typeof form;
        label: string;
        type: string;
        autoComplete: string;
        hint?: string;
    }[] = [
        {
            name: 'name',
            label: 'Full name',
            type: 'text',
            autoComplete: 'name',
        },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        {
            name: 'phone',
            label: 'Phone number (optional)',
            type: 'tel',
            autoComplete: 'tel',
            hint: 'Responders may call you about your request.',
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            autoComplete: 'new-password',
        },
        {
            name: 'password_confirmation',
            label: 'Confirm password',
            type: 'password',
            autoComplete: 'new-password',
        },
    ];

    return (
        <AuthLayout
            title="Create an account"
            subtitle="So you can ask for help and follow your requests."
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                <InlineError
                    message={
                        error && Object.keys(error.errors).length === 0
                            ? error.message
                            : null
                    }
                />
                {fields.map((field) => (
                    <Field
                        key={field.name}
                        label={field.label}
                        hint={field.hint}
                        error={error?.fieldError(field.name)}
                    >
                        {(props) => (
                            <Input
                                {...props}
                                type={field.type}
                                autoComplete={field.autoComplete}
                                value={form[field.name]}
                                onChange={(event) =>
                                    update(field.name)(event.target.value)
                                }
                            />
                        )}
                    </Field>
                ))}
                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                >
                    Create account
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="font-semibold text-sos-700 hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
