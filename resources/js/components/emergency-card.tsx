import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import type { EmergencyType } from '@/types';
import { cn } from '@/utils/cn';

/** A large, tappable card for choosing the kind of emergency. */
export function EmergencyCard({
    type,
    selected,
    onSelect,
}: {
    type: EmergencyType;
    selected: boolean;
    onSelect: (type: EmergencyType) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(type)}
            aria-pressed={selected}
            className={cn(
                'flex min-h-32 flex-col items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition active:scale-[0.98]',
                selected
                    ? 'ring-3 ring-sos-600'
                    : 'ring-slate-200 hover:ring-slate-400',
            )}
        >
            <EmergencyTypeIcon icon={type.icon} slug={type.slug} size="lg" />
            <span>
                <span className="block text-lg leading-tight font-bold text-slate-900">
                    {type.name}
                </span>
                {type.description && (
                    <span className="mt-1 block text-xs leading-snug text-slate-500">
                        {type.description}
                    </span>
                )}
            </span>
        </button>
    );
}
