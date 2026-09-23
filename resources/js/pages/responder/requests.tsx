import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Input } from '@/components/input';
import { LoadingState } from '@/components/loading-state';
import { ReportsTable } from '@/components/reports-table';
import { Select } from '@/components/select';
import { useApiQuery } from '@/hooks/use-api-query';
import { emergencyReportService } from '@/services/emergency-reports';
import { responderService } from '@/services/responder';
import type { ReportFilters } from '@/services/responder';
import {
    PRIORITIES,
    PRIORITY_META,
    STATUS_FLOW,
    STATUS_META,
} from '@/utils/emergency';

const FILTER_KEYS = [
    'status',
    'priority',
    'emergency_type_id',
    'search',
] as const;

export function RequestsPage() {
    const [params, setParams] = useSearchParams();
    const filters: ReportFilters = {
        status: (params.get('status') ?? '') as ReportFilters['status'],
        priority: (params.get('priority') ?? '') as ReportFilters['priority'],
        emergency_type_id: params.get('emergency_type_id') ?? '',
        search: params.get('search') ?? '',
        page: Number(params.get('page') ?? 1),
    };
    const [search, setSearch] = useState(filters.search ?? '');

    const types = useApiQuery(() => emergencyReportService.types(), []);
    const { data, error, isLoading, reload } = useApiQuery(
        () => responderService.reports({ ...filters, per_page: 15 }),
        [params.toString()],
        { pollInterval: 20000 },
    );

    const setFilter = (key: (typeof FILTER_KEYS)[number], value: string) => {
        const next = new URLSearchParams(params);

        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }

        next.delete('page');
        setParams(next);
    };

    const goToPage = (page: number) => {
        const next = new URLSearchParams(params);
        next.set('page', String(page));
        setParams(next);
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        setFilter('search', search.trim());
    };

    const hasFilters = FILTER_KEYS.some((key) => params.get(key));
    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Emergency Requests
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Open requests first, then by priority and waiting time.
                </p>
            </div>

            <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                <form onSubmit={submitSearch} className="relative">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search reference or place"
                        aria-label="Search requests"
                        className="pl-9"
                    />
                </form>
                <Select
                    aria-label="Emergency type"
                    value={filters.emergency_type_id ?? ''}
                    onChange={(event) =>
                        setFilter('emergency_type_id', event.target.value)
                    }
                    placeholder="All types"
                    options={(types.data ?? []).map((type) => ({
                        value: type.id,
                        label: type.name,
                    }))}
                />
                <Select
                    aria-label="Status"
                    value={filters.status ?? ''}
                    onChange={(event) =>
                        setFilter('status', event.target.value)
                    }
                    placeholder="All statuses"
                    options={[
                        { value: 'active', label: 'All active' },
                        {
                            value: 'pending_verification',
                            label: 'Pending verification',
                        },
                        { value: 'with_responder', label: 'With a responder' },
                        ...STATUS_FLOW.map((status) => ({
                            value: status,
                            label: STATUS_META[status].label,
                        })),
                    ]}
                />
                <Select
                    aria-label="Priority"
                    value={filters.priority ?? ''}
                    onChange={(event) =>
                        setFilter('priority', event.target.value)
                    }
                    placeholder="All priorities"
                    options={PRIORITIES.map((priority) => ({
                        value: priority,
                        label: PRIORITY_META[priority].label,
                    }))}
                />
                {hasFilters && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            setParams(new URLSearchParams());
                        }}
                    >
                        <X className="size-4" aria-hidden />
                        Clear
                    </Button>
                )}
            </Card>

            <Card className="overflow-hidden">
                {isLoading && !data && (
                    <LoadingState label="Loading requests…" />
                )}
                {error && !data && (
                    <ErrorState
                        message={error.message}
                        onRetry={reload}
                        className="m-5"
                    />
                )}
                {data && data.data.length === 0 && (
                    <EmptyState
                        title="No emergency requests found."
                        description={
                            hasFilters ? 'Try clearing the filters.' : undefined
                        }
                        className="m-5"
                    />
                )}
                {data && data.data.length > 0 && (
                    <ReportsTable reports={data.data} />
                )}

                {meta && meta.total > 0 && (
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
                        <span>
                            {meta.from}–{meta.to} of {meta.total}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={meta.current_page <= 1}
                                onClick={() => goToPage(meta.current_page - 1)}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => goToPage(meta.current_page + 1)}
                                aria-label="Next page"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
