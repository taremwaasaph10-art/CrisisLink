import {
    ArrowLeft,
    Clock,
    ExternalLink,
    Mail,
    MapPinOff,
    Phone,
    UserRound,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { Card, CardHeader } from '@/components/card';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ReportLocationMap } from '@/components/map/report-location-map';
import { PriorityBadge, StatusBadge } from '@/components/status-badge';
import { StatusTimeline } from '@/components/status-timeline';
import { useApiQuery } from '@/hooks/use-api-query';
import { WorkflowPanel } from '@/pages/responder/request-detail/workflow-panel';
import { responderService } from '@/services/responder';
import {
    formatCoordinates,
    formatDateTime,
    pluralize,
    timeAgo,
} from '@/utils/format';

export function RequestDetailPage() {
    const { id = '' } = useParams();
    const {
        data: report,
        error,
        isLoading,
        reload,
        setData,
    } = useApiQuery(() => responderService.find(id), [id], {
        pollInterval: 10000,
    });

    if (isLoading && !report) {
        return <LoadingState label="Loading request…" />;
    }

    if (error && !report) {
        return <ErrorState message={error.message} onRetry={reload} />;
    }

    if (!report) {
        return null;
    }

    const { latitude, longitude } = report.location;
    const hasCoordinates = latitude !== null && longitude !== null;

    return (
        <div className="space-y-5">
            <Link
                to="/responder/requests"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Emergency Requests
            </Link>

            <header className="flex flex-wrap items-start gap-4">
                <EmergencyTypeIcon
                    icon={report.type?.icon}
                    slug={report.type?.slug}
                    size="lg"
                />
                <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold text-slate-500">
                        {report.reference_number}
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {report.type?.name} emergency
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={report.priority} />
                        <StatusBadge status={report.status} />
                        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="size-4" aria-hidden />
                            Reported {timeAgo(report.reported_at)} ·{' '}
                            {formatDateTime(report.reported_at)}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                    <Card className="overflow-hidden">
                        <CardHeader
                            title="Location"
                            description={
                                report.location.description ??
                                'No written description'
                            }
                            action={
                                hasCoordinates && (
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
                                    >
                                        Open map
                                        <ExternalLink
                                            className="size-4"
                                            aria-hidden
                                        />
                                    </a>
                                )
                            }
                        />
                        {hasCoordinates ? (
                            <>
                                <div className="h-80">
                                    <ReportLocationMap
                                        latitude={latitude}
                                        longitude={longitude}
                                        priority={report.priority}
                                    />
                                </div>
                                <p className="border-t border-slate-100 px-5 py-2.5 font-mono text-xs text-slate-500">
                                    {formatCoordinates(latitude, longitude)}
                                </p>
                            </>
                        ) : (
                            <EmptyState
                                icon={MapPinOff}
                                title="No GPS coordinates"
                                description="The citizen could not share their position. Use the written location and contact details."
                                className="m-5"
                            />
                        )}
                    </Card>

                    <Card>
                        <CardHeader title="Report details" />
                        <div className="space-y-5 px-5 py-4">
                            <p className="text-lg leading-relaxed text-slate-900">
                                {report.description}
                            </p>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <Detail icon={Users} label="People affected">
                                    {pluralize(
                                        report.people_affected,
                                        'person',
                                        'people',
                                    )}
                                </Detail>
                                {report.reporter && (
                                    <>
                                        <Detail
                                            icon={UserRound}
                                            label="Reported by"
                                        >
                                            {report.reporter.name}
                                        </Detail>
                                        <Detail icon={Phone} label="Phone">
                                            {report.reporter.phone ? (
                                                <a
                                                    href={`tel:${report.reporter.phone}`}
                                                    className="text-sky-700 hover:underline"
                                                >
                                                    {report.reporter.phone}
                                                </a>
                                            ) : (
                                                'Not provided'
                                            )}
                                        </Detail>
                                        <Detail icon={Mail} label="Email">
                                            {report.reporter.email}
                                        </Detail>
                                    </>
                                )}
                            </dl>
                            {report.photo_url && (
                                <a
                                    href={report.photo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={report.photo_url}
                                        alt={`Photo attached to ${report.reference_number}`}
                                        className="max-h-96 w-full rounded-xl object-cover ring-1 ring-slate-200"
                                    />
                                </a>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-5">
                    <WorkflowPanel report={report} onUpdated={setData} />

                    {report.assignment && (
                        <Card>
                            <CardHeader title="Assignment" />
                            <dl className="space-y-3 px-5 py-4 text-sm">
                                <Detail icon={UserRound} label="Responder">
                                    {report.assignment.responder?.name}
                                    {report.assignment.responder?.phone && (
                                        <span className="block font-normal text-slate-500">
                                            {report.assignment.responder.phone}
                                        </span>
                                    )}
                                </Detail>
                                <Detail icon={Clock} label="Assigned">
                                    {formatDateTime(
                                        report.assignment.assigned_at,
                                    )}
                                    {report.assignment.completed_at && (
                                        <span className="block font-normal text-slate-500">
                                            Completed{' '}
                                            {formatDateTime(
                                                report.assignment.completed_at,
                                            )}
                                        </span>
                                    )}
                                </Detail>
                                {report.assignment.notes && (
                                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700 ring-1 ring-slate-100">
                                        {report.assignment.notes}
                                    </p>
                                )}
                            </dl>
                        </Card>
                    )}

                    <Card>
                        <CardHeader title="Timeline" />
                        <div className="px-5 py-5">
                            <StatusTimeline
                                status={report.status}
                                updates={report.timeline}
                                showDetails
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Detail({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-slate-400"
                aria-hidden
            />
            <div className="min-w-0">
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {label}
                </dt>
                <dd className="font-semibold break-words text-slate-900">
                    {children}
                </dd>
            </div>
        </div>
    );
}
