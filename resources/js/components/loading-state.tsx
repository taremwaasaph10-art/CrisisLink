import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LoadingState({
    label = 'Loading…',
    className,
}: {
    label?: string;
    className?: string;
}) {
    return (
        <div
            role="status"
            className={cn(
                'flex flex-col items-center justify-center gap-3 py-16 text-slate-500',
                className,
            )}
        >
            <LoaderCircle
                className="size-8 animate-spin text-sos-600"
                aria-hidden
            />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}
