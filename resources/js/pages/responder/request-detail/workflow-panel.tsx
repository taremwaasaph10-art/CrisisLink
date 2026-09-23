import {
    CircleCheck,
    ClipboardCheck,
    Eye,
    Play,
    ShieldCheck,
    UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/button';
import { Card, CardHeader } from '@/components/card';
import { InlineError } from '@/components/error-state';
import { Field, Textarea } from '@/components/input';
import { Modal } from '@/components/modal';
import { Select } from '@/components/select';
import { useApiQuery } from '@/hooks/use-api-query';
import { toApiError } from '@/services/api';
import { responderService } from '@/services/responder';
import type { EmergencyReport, ReportPriority } from '@/types';
import { cn } from '@/utils/cn';
import { PRIORITIES, PRIORITY_META, STATUS_META } from '@/utils/emergency';
import { formatDateTime } from '@/utils/format';

type ActionResult = { report: EmergencyReport; message: string };

/**
 * The responder's next step for this request. Only the action that the
 * backend will accept for the current status is offered.
 */
export function WorkflowPanel({
    report,
    onUpdated,
}: {
    report: EmergencyReport;
    onUpdated: (report: EmergencyReport) => void;
}) {
    const [busyAction, setBusyAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [isConfirmingResolve, setIsConfirmingResolve] = useState(false);

    const isResolved = report.status === 'resolved';

    useEffect(() => {
        if (!notice) {
            return;
        }

        const timer = window.setTimeout(() => setNotice(null), 8000);

        return () => window.clearTimeout(timer);
    }, [notice]);

    const run = async (name: string, action: () => Promise<ActionResult>) => {
        setBusyAction(name);
        setError(null);

        try {
            const result = await action();
            onUpdated(result.report);
            setNotice(result.message);
            setNote('');
            setIsConfirmingResolve(false);
        } catch (caught) {
            const apiError = toApiError(caught);
            setError(
                Object.values(apiError.errors).flat()[0] ?? apiError.message,
            );
        } finally {
            setBusyAction(null);
        }
    };

    const changePriority = (priority: ReportPriority) => {
        if (priority !== report.priority) {
            void run('priority', () =>
                responderService.updatePriority(report.id, priority),
            );
        }
    };

    return (
        <Card className={cn(!isResolved && 'ring-2 ring-slate-900')}>
            <CardHeader
                title={isResolved ? 'Request resolved' : 'Next action'}
                description={
                    isResolved
                        ? undefined
                        : `Currently ${STATUS_META[report.status].label.toLowerCase()}`
                }
            />
            <div className="space-y-5 px-5 py-4">
                {notice && (
                    <p
                        role="status"
                        className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200"
                    >
                        <CircleCheck className="size-4 shrink-0" aria-hidden />
                        {notice}
                    </p>
                )}
                <InlineError message={error} />

                {!isResolved && (
                    <fieldset className="space-y-2">
                        <legend className="text-sm font-semibold text-slate-800">
                            Priority
                        </legend>
                        <div className="grid grid-cols-4 gap-1.5">
                            {PRIORITIES.map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => changePriority(priority)}
                                    disabled={busyAction !== null}
                                    aria-pressed={report.priority === priority}
                                    className={cn(
                                        'rounded-lg px-1 py-2 text-xs font-bold uppercase ring-1 transition disabled:opacity-60',
                                        report.priority === priority
                                            ? PRIORITY_META[priority].badge
                                            : 'bg-white text-slate-600 ring-slate-300 hover:ring-slate-500',
                                    )}
                                >
                                    {PRIORITY_META[priority].label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500">
                            {PRIORITY_META[report.priority].label}:{' '}
                            {PRIORITY_META[report.priority].description}
                        </p>
                    </fieldset>
                )}

                {report.status === 'submitted' && (
                    <Step
                        text="New request. Start the review so the citizen knows it is being handled."
                        action={
                            <Button
                                fullWidth
                                size="lg"
                                isLoading={busyAction === 'review'}
                                onClick={() =>
                                    run('review', () =>
                                        responderService.startReview(report.id),
                                    )
                                }
                            >
                                {busyAction !== 'review' && (
                                    <Eye className="size-5" aria-hidden />
                                )}
                                Start review
                            </Button>
                        }
                    />
                )}

                {report.status === 'under_review' && (
                    <Step
                        text="Check the description and location, set the priority above, then verify."
                        action={
                            <>
                                <NoteField
                                    value={note}
                                    onChange={setNote}
                                    label="Verification note (optional)"
                                />
                                <Button
                                    fullWidth
                                    size="lg"
                                    isLoading={busyAction === 'verify'}
                                    onClick={() =>
                                        run('verify', () =>
                                            responderService.verify(
                                                report.id,
                                                report.priority,
                                                note,
                                            ),
                                        )
                                    }
                                >
                                    {busyAction !== 'verify' && (
                                        <ShieldCheck
                                            className="size-5"
                                            aria-hidden
                                        />
                                    )}
                                    Verify request
                                </Button>
                            </>
                        }
                    />
                )}

                {report.status === 'verified' && (
                    <AssignStep
                        assigneeId={assigneeId}
                        onAssigneeChange={setAssigneeId}
                        note={note}
                        onNoteChange={setNote}
                        isBusy={busyAction === 'assign'}
                        onAssign={() => {
                            if (!assigneeId) {
                                setError(
                                    'Please choose a responder to assign.',
                                );

                                return;
                            }

                            void run('assign', () =>
                                responderService.assign(
                                    report.id,
                                    Number(assigneeId),
                                    note,
                                ),
                            );
                        }}
                    />
                )}

                {report.status === 'assigned' && (
                    <Step
                        text={`${report.assignment?.responder?.name ?? 'The responder'} is assigned. Mark the request in progress once they are on their way.`}
                        action={
                            <Button
                                fullWidth
                                size="lg"
                                isLoading={busyAction === 'progress'}
                                onClick={() =>
                                    run('progress', () =>
                                        responderService.updateStatus(
                                            report.id,
                                            'in_progress',
                                        ),
                                    )
                                }
                            >
                                {busyAction !== 'progress' && (
                                    <Play className="size-5" aria-hidden />
                                )}
                                Mark in progress
                            </Button>
                        }
                    />
                )}

                {report.status === 'in_progress' && (
                    <Step
                        text="When the people are safe and no further help is needed, resolve the request."
                        action={
                            <Button
                                fullWidth
                                size="lg"
                                variant="success"
                                onClick={() => setIsConfirmingResolve(true)}
                            >
                                <CircleCheck className="size-5" aria-hidden />
                                Mark resolved
                            </Button>
                        }
                    />
                )}

                {isResolved && (
                    <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-900">
                        <ClipboardCheck
                            className="mt-0.5 size-5 shrink-0"
                            aria-hidden
                        />
                        Resolved{' '}
                        {formatDateTime(
                            report.timeline?.find(
                                (update) => update.status === 'resolved',
                            )?.created_at,
                        )}
                        . No further action needed.
                    </p>
                )}
            </div>

            <Modal
                open={isConfirmingResolve}
                onClose={() => setIsConfirmingResolve(false)}
                title={`Resolve ${report.reference_number}?`}
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setIsConfirmingResolve(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            isLoading={busyAction === 'resolve'}
                            onClick={() =>
                                run('resolve', () =>
                                    responderService.updateStatus(
                                        report.id,
                                        'resolved',
                                        note,
                                    ),
                                )
                            }
                        >
                            Yes, mark resolved
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-slate-600">
                    The citizen will be told their emergency is resolved and the
                    assignment will be closed. This cannot be undone.
                </p>
                <NoteField
                    value={note}
                    onChange={setNote}
                    label="Resolution note (optional)"
                    className="mt-4"
                />
            </Modal>
        </Card>
    );
}

function Step({ text, action }: { text: string; action: ReactNode }) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-600">{text}</p>
            {action}
        </div>
    );
}

function NoteField({
    value,
    onChange,
    label,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    className?: string;
}) {
    return (
        <Field label={label} className={className}>
            {(props) => (
                <Textarea
                    {...props}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={2}
                    maxLength={1000}
                    className="min-h-16"
                />
            )}
        </Field>
    );
}

function AssignStep({
    assigneeId,
    onAssigneeChange,
    note,
    onNoteChange,
    isBusy,
    onAssign,
}: {
    assigneeId: string;
    onAssigneeChange: (id: string) => void;
    note: string;
    onNoteChange: (note: string) => void;
    isBusy: boolean;
    onAssign: () => void;
}) {
    const responders = useApiQuery(() => responderService.responders(), []);

    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-600">
                Verified. Choose who will respond on the ground.
            </p>
            <Field label="Responder" error={responders.error?.message}>
                {(props) => (
                    <Select
                        {...props}
                        value={assigneeId}
                        onChange={(event) =>
                            onAssigneeChange(event.target.value)
                        }
                        placeholder={
                            responders.isLoading
                                ? 'Loading responders…'
                                : 'Choose a responder'
                        }
                        options={(responders.data ?? []).map((responder) => ({
                            value: responder.id,
                            label: `${responder.name} · ${responder.active_assignments_count ?? 0} open`,
                        }))}
                    />
                )}
            </Field>
            <NoteField
                value={note}
                onChange={onNoteChange}
                label="Instructions for the responder (optional)"
            />
            <Button fullWidth size="lg" isLoading={isBusy} onClick={onAssign}>
                {!isBusy && <UserPlus className="size-5" aria-hidden />}
                Assign responder
            </Button>
        </div>
    );
}
