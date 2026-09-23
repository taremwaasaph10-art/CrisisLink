import {
    DoorOpen,
    Flame,
    HeartPulse,
    Siren,
    Tent,
    TriangleAlert,
    Utensils,
    WavesArrowUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Maps the `icon` key stored on each emergency type to its glyph. */
const ICONS: Record<string, LucideIcon> = {
    waves: WavesArrowUp,
    flame: Flame,
    'heart-pulse': HeartPulse,
    'door-open': DoorOpen,
    utensils: Utensils,
    tent: Tent,
    'triangle-alert': TriangleAlert,
};

const TONES: Record<string, string> = {
    flood: 'bg-blue-100 text-blue-700',
    fire: 'bg-orange-100 text-orange-700',
    medical: 'bg-rose-100 text-rose-700',
    evacuation: 'bg-amber-100 text-amber-800',
    'food-water': 'bg-emerald-100 text-emerald-700',
    shelter: 'bg-violet-100 text-violet-700',
    other: 'bg-slate-200 text-slate-700',
};

export function EmergencyTypeIcon({
    icon,
    slug,
    size = 'md',
    className,
}: {
    icon?: string;
    slug?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const Icon = (icon && ICONS[icon]) || Siren;

    return (
        <span
            className={cn(
                'inline-grid shrink-0 place-items-center rounded-xl',
                (slug && TONES[slug]) || TONES.other,
                size === 'sm' && 'size-8 [&>svg]:size-4',
                size === 'md' && 'size-11 [&>svg]:size-6',
                size === 'lg' && 'size-14 rounded-2xl [&>svg]:size-8',
                className,
            )}
            aria-hidden
        >
            <Icon strokeWidth={2.2} />
        </span>
    );
}
