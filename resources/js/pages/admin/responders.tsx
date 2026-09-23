import { CircleCheck, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState, InlineError } from '@/components/error-state';
import { Field, Input } from '@/components/input';
import { LoadingState } from '@/components/loading-state';
import { Modal } from '@/components/modal';
import { useApiQuery } from '@/hooks/use-api-query';
import { toApiError } from '@/services/api';
import type { ApiError } from '@/services/api';
import { responderService } from '@/services/responder';
import type { NewResponder } from '@/services/responder';

const EMPTY_FORM: NewResponder = {
    name: '',
    email: '',
    phone: '',
    password: '',
};

/** Admins create responder accounts; there is no public sign-up for responders. */
export function RespondersPage() {
    const { data, error, isLoading, reload } = useApiQuery(
        () => responderService.responders(),
        [],
    );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<NewResponder>(EMPTY_FORM);
    const [formError, setFormError] = useState<ApiError | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        setFormError(null);

        try {
            const responder = await responderService.createResponder({
                ...form,
                phone: form.phone || undefined,
            });
            setNotice(`${responder.name} can now sign in as a responder.`);
            setIsFormOpen(false);
            setForm(EMPTY_FORM);
            reload();
        } catch (caught) {
            setFormError(toApiError(caught));
        } finally {
            setIsSaving(false);
        }
    };

    const fields: {
        name: keyof NewResponder;
        label: string;
        type: string;
        autoComplete: string;
    }[] = [
        { name: 'name', label: 'Full name', type: 'text', autoComplete: 'off' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'off' },
        {
            name: 'phone',
            label: 'Phone (optional)',
            type: 'tel',
            autoComplete: 'off',
        },
        {
            name: 'password',
            label: 'Temporary password',
            type: 'password',
            autoComplete: 'new-password',
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Responder Team
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        People who can be assigned to emergency requests.
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <UserPlus className="size-5" aria-hidden />
                    Add responder
                </Button>
            </div>

            {notice && (
                <p
                    role="status"
                    className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200"
                >
                    <CircleCheck className="size-4" aria-hidden />
                    {notice}
                </p>
            )}

            <Card className="overflow-hidden">
                {isLoading && !data && <LoadingState />}
                {error && !data && (
                    <ErrorState
                        message={error.message}
                        onRetry={reload}
                        className="m-5"
                    />
                )}
                {data && data.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="No responders yet."
                        className="m-5"
                    />
                )}
                {data && data.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-3 py-3">
                                        Email
                                    </th>
                                    <th scope="col" className="px-3 py-3">
                                        Phone
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Open assignments
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((responder) => (
                                    <tr key={responder.id}>
                                        <td className="px-5 py-3 font-semibold text-slate-900">
                                            {responder.name}
                                        </td>
                                        <td className="px-3 py-3 text-slate-600">
                                            {responder.email}
                                        </td>
                                        <td className="px-3 py-3 text-slate-600">
                                            {responder.phone ?? '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-slate-900 tabular-nums">
                                            {responder.active_assignments_count ??
                                                0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Add a responder"
            >
                <form onSubmit={submit} className="space-y-4" noValidate>
                    <InlineError
                        message={
                            formError &&
                            Object.keys(formError.errors).length === 0
                                ? formError.message
                                : null
                        }
                    />
                    {fields.map((field) => (
                        <Field
                            key={field.name}
                            label={field.label}
                            error={formError?.fieldError(field.name)}
                        >
                            {(props) => (
                                <Input
                                    {...props}
                                    type={field.type}
                                    autoComplete={field.autoComplete}
                                    value={form[field.name] ?? ''}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            [field.name]: event.target.value,
                                        }))
                                    }
                                />
                            )}
                        </Field>
                    ))}
                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setIsFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSaving}>
                            Create account
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
