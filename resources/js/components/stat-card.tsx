import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/utils/cn';

export function StatCard({
    label,
    value,
    icon: Icon,
    tone,
    to,
}: {
    label: string;
    value: number | undefined;
    icon: LucideIcon;
    tone: string;
    to: string;
}) {
    return (
        <Link
            to={to}
            className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
        >
            <span
                className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-xl',
                    tone,
                )}
            >
                <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
                <span className="block text-3xl leading-none font-bold text-slate-900 tabular-nums">
                    {value ?? '–'}
                </span>
                <span className="mt-1 block text-sm font-medium text-slate-500 group-hover:text-slate-700">
                    {label}
                </span>
            </span>
        </Link>
    );
}
