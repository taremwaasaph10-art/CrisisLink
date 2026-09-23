import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
    className,
}: {
    title: string;
    description?: ReactNode;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center',
                className,
            )}
        >
            <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
                <Icon className="size-6" aria-hidden />
            </span>
            <div>
                <p className="font-semibold text-slate-900">{title}</p>
                {description && (
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
