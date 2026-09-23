import { Link, useNavigate } from 'react-router';
import { EmergencyTypeIcon } from '@/components/emergency-type-icon';
import { RequestCard } from '@/components/request-card';
import { PriorityBadge, StatusBadge } from '@/components/status-badge';
import type { EmergencyReport } from '@/types';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/format';

/** Requests as a table on wide screens and as cards on phones. */
export function ReportsTable({ reports }: { reports: EmergencyReport[] }) {
    const navigate = useNavigate();

    return (
        <>
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        <tr>
                            <th scope="col" className="px-5 py-3">
                                Request
                            </th>
                            <th scope="col" className="px-3 py-3">
                                Location
                            </th>
                            <th scope="col" className="px-3 py-3">
                                Priority
                            </th>
                            <th scope="col" className="px-3 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-3 py-3">
                                Reported
                            </th>
                            <th scope="col" className="px-5 py-3 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.map((report) => (
                            <tr
                                key={report.id}
                                onClick={() =>
                                    navigate(`/responder/requests/${report.id}`)
                                }
                                className={cn(
                                    'cursor-pointer hover:bg-slate-50',
                                    report.priority === 'critical' &&
                                        report.status !== 'resolved' &&
                                        'bg-red-50/60',
                                )}
                            >
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <EmergencyTypeIcon
                                            icon={report.type?.icon}
                                            slug={report.type?.slug}
                                            size="sm"
                                        />
                                        <div>
                                            <div className="font-semibold text-slate-900">
                                                {report.type?.name}
                                            </div>
                                            <div className="font-mono text-xs text-slate-500">
                                                {report.reference_number}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="max-w-64 truncate px-3 py-3 text-slate-700">
                                    {report.location.description ?? 'GPS only'}
                                </td>
                                <td className="px-3 py-3">
                                    <PriorityBadge priority={report.priority} />
                                </td>
                                <td className="px-3 py-3">
                                    <StatusBadge status={report.status} />
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                                    {timeAgo(report.reported_at)}
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link
                                        to={`/responder/requests/${report.id}`}
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        className="rounded-lg px-3 py-1.5 font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-white hover:ring-slate-500"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
                {reports.map((report) => (
                    <RequestCard
                        key={report.id}
                        report={report}
                        to={`/responder/requests/${report.id}`}
                        showPriority
                    />
                ))}
            </div>
        </>
    );
}
