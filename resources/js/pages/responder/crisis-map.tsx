import { MapPinOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/card';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import {
    CrisisMapView,
    hasCoordinates,
} from '@/components/map/crisis-map-view';
import { Select } from '@/components/select';
import { PriorityBadge, StatusBadge } from '@/components/status-badge';
import { useApiQuery } from '@/hooks/use-api-query';
import { emergencyReportService } from '@/services/emergency-reports';
import { responderService } from '@/services/responder';
import type { ReportPriority } from '@/types';
import { cn } from '@/utils/cn';
import { PRIORITIES, PRIORITY_META } from '@/utils/emergency';
import { timeAgo } from '@/utils/format';

const LEGEND_DOT: Record<ReportPriority, string> = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-amber-400',
    low: 'bg-slate-500',
};

export function CrisisMapPage() {
    const [typeId, setTypeId] = useState('');
    const [priority, setPriority] = useState<ReportPriority | ''>('');

    const types = useApiQuery(() => emergencyReportService.types(), []);
    const { data, error, isLoading, reload } = useApiQuery(
        () =>
            responderService.reports({
                status: 'active',
                emergency_type_id: typeId,
                priority,
                per_page: 200,
            }),
        [typeId, priority],
        { pollInterval: 20000 },
    );

    const reports = data?.data ?? [];
    const withoutGps = reports.filter((report) => !hasCoordinates(report));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Crisis Map
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {data
                            ? `${reports.length} active requests`
                            : 'Loading active requests…'}
                        {withoutGps.length > 0 &&
                            ` · ${withoutGps.length} without GPS`}
                    </p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                    <Select
                        aria-label="Emergency type"
                        value={typeId}
                        onChange={(event) => setTypeId(event.target.value)}
                        placeholder="All types"
                        options={(types.data ?? []).map((type) => ({
                            value: type.id,
                            label: type.name,
                        }))}
                    />
                    <Select
                        aria-label="Priority"
                        value={priority}
                        onChange={(event) =>
                            setPriority(
                                event.target.value as ReportPriority | '',
                            )
                        }
                        placeholder="All priorities"
                        options={PRIORITIES.map((value) => ({
                            value,
                            label: PRIORITY_META[value].label,
                        }))}
                    />
                </div>
            </div>

            {error && !data && (
                <ErrorState message={error.message} onRetry={reload} />
            )}

            <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
                <Card className="relative h-[calc(100dvh-14rem)] min-h-[26rem] overflow-hidden">
                    {isLoading && !data ? (
                        <LoadingState label="Loading map…" className="h-full" />
                    ) : (
                        <CrisisMapView reports={reports} />
                    )}
                    <div className="absolute bottom-3 left-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs shadow-md ring-1 ring-slate-200">
                        <p className="mb-1 font-semibold text-slate-700">
                            Priority
                        </p>
                        <ul className="space-y-1">
                            {PRIORITIES.map((value) => (
                                <li
                                    key={value}
                                    className="flex items-center gap-2 text-slate-600"
                                >
                                    <span
                                        className={cn(
                                            'size-3 rounded-full ring-2 ring-white',
                                            LEGEND_DOT[value],
                                        )}
                                    />
                                    {PRIORITY_META[value].label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>

                <Card className="flex max-h-[calc(100dvh-14rem)] min-h-[16rem] flex-col overflow-hidden">
                    <p className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                        Most urgent first
                    </p>
                    <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
                        {data && reports.length === 0 && (
                            <li className="px-4 py-8 text-center text-sm text-slate-500">
                                No emergency requests found.
                            </li>
                        )}
                        {reports.map((report) => (
                            <li key={report.id}>
                                <Link
                                    to={`/responder/requests/${report.id}`}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50"
                                >
                                    <EmergencyTypeIcon
                                        icon={report.type?.icon}
                                        slug={report.type?.slug}
                                        size="sm"
                                    />
                                    <span className="min-w-0 flex-1 space-y-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-semibold text-slate-900">
                                                {report.type?.name} ·{' '}
                                                <span className="font-mono text-xs">
                                                    {report.reference_number}
                                                </span>
                                            </span>
                                            <PriorityBadge
                                                priority={report.priority}
                                            />
                                        </span>
                                        <span className="block truncate text-xs text-slate-500">
                                            {!hasCoordinates(report) && (
                                                <MapPinOff
                                                    className="mr-1 inline size-3 text-amber-600"
                                                    aria-label="No GPS"
                                                />
                                            )}
                                            {report.location.description ??
                                                'GPS only'}{' '}
                                            · {timeAgo(report.reported_at)}
                                        </span>
                                        <StatusBadge status={report.status} />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}
