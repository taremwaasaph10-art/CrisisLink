import { ChevronRight, ClipboardList, PhoneCall } from 'lucide-react';
import { Link } from 'react-router';
import { AlertBanner } from '@/components/alert-banner';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/context/auth-context';
import { useApiQuery } from '@/hooks/use-api-query';
import { emergencyReportService } from '@/services/emergency-reports';
import { STATUS_META } from '@/utils/emergency';
import { timeAgo } from '@/utils/format';

export function CitizenHomePage() {
    const { user } = useAuth();
    const alerts = useApiQuery(() => emergencyReportService.alerts(), [], {
        pollInterval: 60000,
    });
    const requests = useApiQuery(() => emergencyReportService.mine(), [], {
        pollInterval: 15000,
    });

    const activeRequest = requests.data?.find(
        (report) => report.status !== 'resolved',
    );
    const firstName = user?.name.split(' ')[0];

    return (
        <div className="space-y-7">
            <section className="text-center">
                <p className="text-sm font-medium text-slate-500">
                    Hello {firstName}. Stay safe.
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    Do you need help right now?
                </h1>

                <div className="relative mx-auto mt-6 grid size-60 place-items-center">
                    <span
                        className="absolute inset-0 animate-sos-pulse rounded-full bg-sos-500"
                        aria-hidden
                    />
                    <span
                        className="absolute inset-3 rounded-full bg-sos-100"
                        aria-hidden
                    />
                    <Link
                        to="/emergency/new"
                        className="relative grid size-52 place-items-center rounded-full bg-sos-600 text-white shadow-2xl ring-8 shadow-sos-600/40 ring-white transition hover:bg-sos-700 active:scale-95"
                        aria-label="SOS — I need help. Report an emergency."
                    >
                        <span className="text-center">
                            <span className="block text-6xl leading-none font-black tracking-tight">
                                SOS
                            </span>
                            <span className="mt-2 block text-base font-bold tracking-wide uppercase">
                                I need help
                            </span>
                        </span>
                    </Link>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                    Tap the button to report your emergency and share your
                    location.
                </p>
            </section>

            {activeRequest && (
                <Link
                    to={`/emergency/${activeRequest.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-2 ring-sos-600"
                >
                    <EmergencyTypeIcon
                        icon={activeRequest.type?.icon}
                        slug={activeRequest.type?.slug}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold tracking-wide text-sos-700 uppercase">
                            Your active request
                        </p>
                        <p className="font-bold text-slate-900">
                            {activeRequest.type?.name} ·{' '}
                            <span className="font-mono">
                                {activeRequest.reference_number}
                            </span>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <StatusBadge status={activeRequest.status} />
                            <span className="text-xs text-slate-500">
                                {timeAgo(activeRequest.reported_at)}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            {STATUS_META[activeRequest.status].citizenHint}
                        </p>
                    </div>
                    <ChevronRight
                        className="size-5 text-slate-400"
                        aria-hidden
                    />
                </Link>
            )}

            <section aria-labelledby="alerts-heading" className="space-y-3">
                <h2
                    id="alerts-heading"
                    className="text-lg font-bold text-slate-900"
                >
                    Emergency alerts
                </h2>
                {alerts.data && alerts.data.length === 0 && (
                    <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                        No active alerts in your area.
                    </p>
                )}
                {alerts.data?.map((alert) => (
                    <AlertBanner key={alert.id} alert={alert} />
                ))}
                {alerts.error && !alerts.data && (
                    <p className="text-sm text-slate-500">
                        Alerts could not be loaded.
                    </p>
                )}
            </section>

            <Link
                to="/my-requests"
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:ring-slate-400"
            >
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <ClipboardList className="size-6" aria-hidden />
                </span>
                <span className="flex-1">
                    <span className="block font-bold text-slate-900">
                        My Requests
                    </span>
                    <span className="block text-sm text-slate-500">
                        Follow the status of your requests
                    </span>
                </span>
                <ChevronRight className="size-5 text-slate-400" aria-hidden />
            </Link>

            <p className="flex items-start gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                <PhoneCall className="mt-0.5 size-4 shrink-0" aria-hidden />
                If someone's life is in immediate danger and you can make a
                call, also contact your local emergency number.
            </p>
        </div>
    );
}
