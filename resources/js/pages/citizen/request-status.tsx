import {
    ArrowLeft,
    CircleCheck,
    Clock,
    MapPin,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Card, CardHeader } from '@/components/card';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ReportLocationMap } from '@/components/map/report-location-map';
import { StatusBadge } from '@/components/status-badge';
import { StatusTimeline } from '@/components/status-timeline';
import { useApiQuery } from '@/hooks/use-api-query';
import { emergencyReportService } from '@/services/emergency-reports';
import { cn } from '@/utils/cn';
import { STATUS_META } from '@/utils/emergency';
import { formatDateTime, pluralize } from '@/utils/format';

export function RequestStatusPage() {
    const { id = '' } = useParams();
    const [params] = useSearchParams();
    const justSubmitted = params.get('submitted') === '1';

    const {
        data: report,
        error,
        isLoading,
        reload,
    } = useApiQuery(() => emergencyReportService.find(id), [id], {
        pollInterval: 10000,
    });

    if (isLoading && !report) {
        return <LoadingState label="Loading your request…" />;
    }

    if (error && !report) {
        return <ErrorState message={error.message} onRetry={reload} />;
    }

    if (!report) {
        return null;
    }

    const { latitude, longitude } = report.location;
    const isResolved = report.status === 'resolved';

    return (
        <div className="space-y-5">
            <Link
                to="/my-requests"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="size-4" aria-hidden />
                My Requests
            </Link>

            {justSubmitted && (
                <section
                    role="status"
                    className="rounded-2xl bg-emerald-600 p-5 text-center text-white shadow-lg shadow-emerald-600/20"
                >
                    <CircleCheck className="mx-auto size-12" aria-hidden />
                    <h1 className="mt-2 text-xl font-bold">
                        Your emergency request has been submitted.
                    </h1>
                    <p className="mt-3 text-sm text-emerald-50">
                        Your reference number
                    </p>
                    <p className="mt-1 font-mono text-3xl font-bold tracking-wider">
                        {report.reference_number}
                    </p>
                    <p className="mt-3 text-sm text-emerald-50">
                        Responders have been alerted. Stay where you are if it
                        is safe, and keep your phone with you.
                    </p>
                </section>
            )}

            <Card className="p-5">
                <div className="flex items-start gap-3">
                    <EmergencyTypeIcon
                        icon={report.type?.icon}
                        slug={report.type?.slug}
                        size="lg"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-semibold text-slate-500">
                            {report.reference_number}
                        </p>
                        <h2 className="text-xl font-bold text-slate-900">
                            {report.type?.name} emergency
                        </h2>
                        <StatusBadge
                            status={report.status}
                            className="mt-1.5"
                        />
                    </div>
                </div>
                <p
                    className={cn(
                        'mt-4 rounded-xl px-4 py-3 text-sm font-semibold',
                        isResolved
                            ? 'bg-emerald-50 text-emerald-900'
                            : 'bg-blue-50 text-blue-900',
                    )}
                >
                    {STATUS_META[report.status].citizenHint}
                    {!isResolved && ' This page updates automatically.'}
                </p>
            </Card>

            {report.assignment?.responder && (
                <Card className="flex items-center gap-3 p-4">
                    <span className="grid size-11 place-items-center rounded-full bg-violet-100 text-violet-700">
                        <ShieldCheck className="size-6" aria-hidden />
                    </span>
                    <div>
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Assigned responder
                        </p>
                        <p className="font-bold text-slate-900">
                            {report.assignment.responder.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            Since{' '}
                            {formatDateTime(report.assignment.assigned_at)}
                        </p>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader title="Request status" />
                <div className="px-5 py-5">
                    <StatusTimeline
                        status={report.status}
                        updates={report.timeline}
                    />
                </div>
            </Card>

            <Card>
                <CardHeader title="Your report" />
                <dl className="space-y-4 px-5 py-4 text-sm">
                    <div>
                        <dt className="font-semibold text-slate-500">
                            Description
                        </dt>
                        <dd className="mt-1 text-base text-slate-900">
                            {report.description}
                        </dd>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        <div className="flex items-center gap-2">
                            <Users
                                className="size-4 text-slate-400"
                                aria-hidden
                            />
                            <dt className="sr-only">People affected</dt>
                            <dd className="font-semibold text-slate-900">
                                {pluralize(
                                    report.people_affected,
                                    'person',
                                    'people',
                                )}
                            </dd>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock
                                className="size-4 text-slate-400"
                                aria-hidden
                            />
                            <dt className="sr-only">Reported</dt>
                            <dd className="font-semibold text-slate-900">
                                {formatDateTime(report.reported_at)}
                            </dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin
                            className="mt-0.5 size-4 shrink-0 text-slate-400"
                            aria-hidden
                        />
                        <dt className="sr-only">Location</dt>
                        <dd className="text-slate-900">
                            {report.location.description ?? 'Shared by GPS'}
                        </dd>
                    </div>
                </dl>
                {latitude !== null && longitude !== null && (
                    <div className="h-48 overflow-hidden border-t border-slate-100">
                        <ReportLocationMap
                            latitude={latitude}
                            longitude={longitude}
                            priority={report.priority}
                        />
                    </div>
                )}
                {report.photo_url && (
                    <img
                        src={report.photo_url}
                        alt="Photo you attached to the request"
                        className="max-h-72 w-full border-t border-slate-100 object-cover"
                    />
                )}
            </Card>
        </div>
    );
}
