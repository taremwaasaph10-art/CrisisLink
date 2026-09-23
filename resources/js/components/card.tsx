import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'rounded-2xl bg-white shadow-sm ring-1 ring-slate-200',
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({
    title,
    description,
    action,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4',
                className,
            )}
        >
            <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900">
                    {title}
                </h2>
                {description && (
                    <p className="mt-0.5 text-sm text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}
