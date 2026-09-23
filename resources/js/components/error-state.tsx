import { CircleAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/button';
import { cn } from '@/utils/cn';

export function ErrorState({
    message,
    onRetry,
    className,
}: {
    message: string;
    onRetry?: () => void;
    className?: string;
}) {
    return (
        <div
            role="alert"
            className={cn(
                'flex flex-col items-center gap-3 rounded-2xl bg-sos-50 px-6 py-10 text-center ring-1 ring-sos-100',
                className,
            )}
        >
            <CircleAlert className="size-8 text-sos-600" aria-hidden />
            <p className="font-semibold text-sos-800">{message}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    <RefreshCw className="size-4" aria-hidden />
                    Try again
                </Button>
            )}
        </div>
    );
}

/** A compact inline error, e.g. under a form or action. */
export function InlineError({ message }: { message: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-sos-50 px-3 py-2.5 text-sm font-medium text-sos-800 ring-1 ring-sos-100"
        >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {message}
        </p>
    );
}
