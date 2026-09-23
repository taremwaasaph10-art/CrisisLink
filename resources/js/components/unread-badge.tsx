import { cn } from '@/utils/cn';

export function UnreadBadge({
    count,
    className,
}: {
    count: number;
    className?: string;
}) {
    if (count === 0) {
        return null;
    }

    return (
        <span
            className={cn(
                'grid h-5 min-w-5 place-items-center rounded-full bg-sos-600 px-1 text-[11px] font-bold text-white tabular-nums',
                className,
            )}
        >
            {count > 99 ? '99+' : count}
            <span className="sr-only"> unread</span>
        </span>
    );
}
