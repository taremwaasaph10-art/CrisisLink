import { Info, Megaphone, OctagonAlert } from 'lucide-react';
import type { EmergencyAlert } from '@/types';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/format';

const TONES = {
    danger: {
        icon: OctagonAlert,
        box: 'bg-sos-600 text-white',
        meta: 'text-sos-100',
    },
    warning: {
        icon: Megaphone,
        box: 'bg-amber-100 text-amber-950 ring-1 ring-amber-300',
        meta: 'text-amber-800',
    },
    info: {
        icon: Info,
        box: 'bg-sky-50 text-sky-950 ring-1 ring-sky-200',
        meta: 'text-sky-700',
    },
} as const;

/** A public emergency alert, such as a flood warning for an area. */
export function AlertBanner({ alert }: { alert: EmergencyAlert }) {
    const tone = TONES[alert.severity];
    const Icon = tone.icon;

    return (
        <article className={cn('flex gap-3 rounded-2xl p-4', tone.box)}>
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="min-w-0">
                <h3 className="font-bold">{alert.title}</h3>
                <p className="mt-1 text-sm leading-relaxed opacity-95">
                    {alert.message}
                </p>
                <p className={cn('mt-2 text-xs font-medium', tone.meta)}>
                    {alert.area && <>{alert.area} · </>}
                    {timeAgo(alert.created_at)}
                </p>
            </div>
        </article>
    );
}
