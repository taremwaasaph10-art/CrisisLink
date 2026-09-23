import {
    CircleCheck,
    ClipboardCheck,
    Map as MapIcon,
    Radio,
    ShieldAlert,
    Siren,
    Truck,
} from 'lucide-react';
import { ButtonLink } from '@/components/button';
import { Card, CardHeader } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ReportsTable } from '@/components/reports-table';
import { StatCard } from '@/components/stat-card';
import { useApiQuery } from '@/hooks/use-api-query';
import { responderService } from '@/services/responder';

export function DashboardPage() {
    const { data, error, isLoading, reload } = useApiQuery(
        () => responderService.dashboard(),
        [],
        {
            pollInterval: 15000,
        },
    );

    const stats = data?.stats;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <Radio
                            className="size-4 text-emerald-600"
                            aria-hidden
                        />
                        Live overview · refreshes every 15 seconds
                    </p>
                </div>
                <ButtonLink to="/responder/map" variant="danger">
                    <MapIcon className="size-5" aria-hidden />
                    Open crisis map
                </ButtonLink>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    label="Active requests"
                    value={stats?.active}
                    icon={Siren}
                    tone="bg-slate-900 text-white"
                    to="/responder/requests?status=active"
                />
                <StatCard
                    label="Critical"
                    value={stats?.critical}
                    icon={ShieldAlert}
                    tone="bg-red-600 text-white"
                    to="/responder/requests?status=active&priority=critical"
                />
                <StatCard
                    label="Pending verification"
                    value={stats?.pending_verification}
                    icon={ClipboardCheck}
                    tone="bg-amber-100 text-amber-800"
                    to="/responder/requests?status=pending_verification"
                />
                <StatCard
                    label="Assigned"
                    value={stats?.assigned}
                    icon={Truck}
                    tone="bg-violet-100 text-violet-700"
                    to="/responder/requests?status=with_responder"
                />
                <StatCard
                    label="Resolved"
                    value={stats?.resolved}
                    icon={CircleCheck}
                    tone="bg-emerald-100 text-emerald-700"
                    to="/responder/requests?status=resolved"
                />
            </div>

            <Card>
                <CardHeader
                    title="Active emergencies"
                    description="Most urgent first"
                    action={
                        <ButtonLink
                            to="/responder/requests?status=active"
                            variant="secondary"
                            size="sm"
                        >
                            View all
                        </ButtonLink>
                    }
                />
                {isLoading && !data && <LoadingState />}
                {error && !data && (
                    <ErrorState
                        message={error.message}
                        onRetry={reload}
                        className="m-5"
                    />
                )}
                {data && data.active_requests.length === 0 && (
                    <EmptyState
                        title="No emergency requests found."
                        description="New SOS requests appear here automatically."
                        className="m-5"
                    />
                )}
                {data && data.active_requests.length > 0 && (
                    <ReportsTable reports={data.active_requests} />
                )}
            </Card>
        </div>
    );
}
