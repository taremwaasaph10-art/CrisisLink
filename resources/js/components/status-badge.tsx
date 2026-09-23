import type { ReportPriority, ReportStatus } from '@/types';
import { cn } from '@/utils/cn';
import { PRIORITY_META, STATUS_META } from '@/utils/emergency';

export function StatusBadge({
    status,
    className,
}: {
    status: ReportStatus;
    className?: string;
}) {
    const meta = STATUS_META[status];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset',
                meta.badge,
                className,
            )}
        >
            <span
                className={cn('size-1.5 rounded-full', meta.dot)}
                aria-hidden
            />
            {meta.label}
        </span>
    );
}

export function PriorityBadge({
    priority,
    className,
}: {
    priority: ReportPriority;
    className?: string;
}) {
    const meta = PRIORITY_META[priority];

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase ring-1 ring-inset',
                meta.badge,
                className,
            )}
        >
            {meta.label}
        </span>
    );
}
