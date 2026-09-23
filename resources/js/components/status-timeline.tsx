import { Check } from 'lucide-react';
import type { ReportStatus, StatusUpdate } from '@/types';
import { cn } from '@/utils/cn';
import { STATUS_FLOW, STATUS_META } from '@/utils/emergency';
import { formatDateTime } from '@/utils/format';

/**
 * The request's journey as a vertical stepper: done steps show when they
 * happened, the current step is highlighted, future steps are muted.
 */
export function StatusTimeline({
    status,
    updates = [],
    showDetails = false,
}: {
    status: ReportStatus;
    updates?: StatusUpdate[];
    /** Show who made each change and their note (responders only). */
    showDetails?: boolean;
}) {
    const currentIndex = STATUS_FLOW.indexOf(status);
    const isFinished = status === 'resolved';

    return (
        <ol className="relative space-y-0">
            {STATUS_FLOW.map((step, index) => {
                const update = updates.find((entry) => entry.status === step);
                const isDone =
                    index < currentIndex ||
                    (isFinished && index === currentIndex);
                const isCurrent = index === currentIndex && !isFinished;
                const isLast = index === STATUS_FLOW.length - 1;

                return (
                    <li
                        key={step}
                        className="relative flex gap-4 pb-6 last:pb-0"
                    >
                        {!isLast && (
                            <span
                                className={cn(
                                    'absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5',
                                    index < currentIndex
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-200',
                                )}
                                aria-hidden
                            />
                        )}
                        <span
                            className={cn(
                                'relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold',
                                isDone && 'bg-emerald-500 text-white',
                                isCurrent &&
                                    'bg-sos-600 text-white ring-4 ring-sos-100',
                                !isDone &&
                                    !isCurrent &&
                                    'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
                            )}
                            aria-hidden
                        >
                            {isDone ? (
                                <Check className="size-4" strokeWidth={3} />
                            ) : (
                                index + 1
                            )}
                        </span>
                        <div className="min-w-0 pt-1">
                            <p
                                className={cn(
                                    'font-semibold',
                                    isDone || isCurrent
                                        ? 'text-slate-900'
                                        : 'text-slate-400',
                                )}
                            >
                                {STATUS_META[step].label}
                                {isCurrent && (
                                    <span className="sr-only">
                                        {' '}
                                        (current step)
                                    </span>
                                )}
                            </p>
                            {(isDone || isCurrent) && (
                                <p className="text-sm text-slate-500">
                                    {update
                                        ? formatDateTime(update.created_at)
                                        : STATUS_META[step].citizenHint}
                                    {showDetails && update?.actor && (
                                        <> · {update.actor}</>
                                    )}
                                </p>
                            )}
                            {isCurrent && !showDetails && (
                                <p className="mt-1 text-sm font-medium text-sos-700">
                                    {STATUS_META[step].citizenHint}
                                </p>
                            )}
                            {showDetails && update?.note && (
                                <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
                                    {update.note}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
