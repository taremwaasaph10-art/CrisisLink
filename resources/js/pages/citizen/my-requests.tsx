import { useState } from 'react';
import { ButtonLink } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { RequestCard } from '@/components/request-card';
import { useApiQuery } from '@/hooks/use-api-query';
import { emergencyReportService } from '@/services/emergency-reports';
import { cn } from '@/utils/cn';

type Tab = 'active' | 'past';

export function MyRequestsPage() {
    const [tab, setTab] = useState<Tab>('active');
    const { data, error, isLoading, reload } = useApiQuery(
        () => emergencyReportService.mine(),
        [],
        {
            pollInterval: 15000,
        },
    );

    const active = data?.filter((report) => report.status !== 'resolved') ?? [];
    const past = data?.filter((report) => report.status === 'resolved') ?? [];
    const shown = tab === 'active' ? active : past;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>

            <div
                role="tablist"
                aria-label="Request status"
                className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1"
            >
                {(
                    [
                        ['active', 'Active', active.length],
                        ['past', 'Resolved', past.length],
                    ] as const
                ).map(([value, label, count]) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        onClick={() => setTab(value)}
                        className={cn(
                            'rounded-lg py-2 text-sm font-semibold transition',
                            tab === value
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600',
                        )}
                    >
                        {label}{' '}
                        {data && (
                            <span className="text-slate-400">({count})</span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading && !data && (
                <LoadingState label="Loading your requests…" />
            )}
            {error && !data && (
                <ErrorState message={error.message} onRetry={reload} />
            )}

            {data && shown.length === 0 && (
                <EmptyState
                    title="No emergency requests found."
                    description={
                        tab === 'active'
                            ? 'If you need help, press SOS.'
                            : 'Resolved requests will appear here.'
                    }
                    action={
                        tab === 'active' && (
                            <ButtonLink to="/emergency/new" variant="danger">
                                SOS — I need help
                            </ButtonLink>
                        )
                    }
                />
            )}

            <div className="space-y-3">
                {shown.map((report) => (
                    <RequestCard
                        key={report.id}
                        report={report}
                        to={`/emergency/${report.id}`}
                    />
                ))}
            </div>
        </div>
    );
}
