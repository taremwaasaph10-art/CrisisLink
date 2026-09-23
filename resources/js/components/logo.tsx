import { cn } from '@/utils/cn';

export function LogoMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            className={cn('size-8 shrink-0', className)}
            aria-hidden
        >
            <rect width="32" height="32" rx="8" fill="#dc2626" />
            <path
                d="M4 17h6l2.5-6 4 12 3-8 1.5 2H28"
                fill="none"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function Logo({
    inverted = false,
    className,
}: {
    inverted?: boolean;
    className?: string;
}) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <LogoMark />
            <span
                className={cn(
                    'text-lg font-bold tracking-tight',
                    inverted ? 'text-white' : 'text-slate-900',
                )}
            >
                Crisis<span className="text-sos-600">Link</span>
            </span>
        </span>
    );
}
