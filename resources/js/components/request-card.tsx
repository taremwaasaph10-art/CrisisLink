import { ChevronRight, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { PriorityBadge, StatusBadge } from '@/components/status-badge';
import type { EmergencyReport } from '@/types';
import { timeAgo } from '@/utils/format';

/** Summary of one emergency request in a list. */
export function RequestCard({
    report,
    to,
    showPriority = false,
}: {
    report: EmergencyReport;
    to: string;
    showPriority?: boolean;
}) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
        >
            <EmergencyTypeIcon
                icon={report.type?.icon}
                slug={report.type?.slug}
            />
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold text-slate-900">
                        {report.type?.name ?? 'Emergency'}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                        {report.reference_number}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={report.status} />
                    {showPriority && (
                        <PriorityBadge priority={report.priority} />
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex min-w-0 items-center gap-1">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">
                            {report.location.description ??
                                'Location shared by GPS'}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden />
                        {report.people_affected}
                    </span>
                    <span>{timeAgo(report.reported_at)}</span>
                </div>
            </div>
            <ChevronRight
                className="size-5 shrink-0 text-slate-400"
                aria-hidden
            />
        </Link>
    );
}
