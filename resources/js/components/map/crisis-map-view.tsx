import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router';
import { BaseMap } from '@/components/map/base-map';
import { pinIcon } from '@/components/map/pins';
import { PriorityBadge, StatusBadge } from '@/components/status-badge';
import type { EmergencyReport } from '@/types';
import { DEFAULT_MAP_CENTER } from '@/utils/emergency';
import { pluralize, timeAgo } from '@/utils/format';

type LocatedReport = EmergencyReport & {
    location: { latitude: number; longitude: number };
};

export function hasCoordinates(
    report: EmergencyReport,
): report is LocatedReport {
    return (
        report.location.latitude !== null && report.location.longitude !== null
    );
}

/** Every request with GPS coordinates as a priority-coloured pin. */
export function CrisisMapView({
    reports,
    className,
}: {
    reports: EmergencyReport[];
    className?: string;
}) {
    const located = reports.filter(hasCoordinates);

    return (
        <BaseMap center={DEFAULT_MAP_CENTER} zoom={13} className={className}>
            <FitToReports reports={located} />
            {located.map((report) => (
                <Marker
                    key={report.id}
                    position={[
                        report.location.latitude,
                        report.location.longitude,
                    ]}
                    icon={pinIcon(report.priority)}
                    zIndexOffset={report.priority === 'critical' ? 1000 : 0}
                    title={`${report.reference_number} · ${report.type?.name ?? 'Emergency'}`}
                >
                    <Popup>
                        <div className="w-60 space-y-2 text-slate-900">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-semibold text-slate-500">
                                    {report.reference_number}
                                </span>
                                <PriorityBadge priority={report.priority} />
                            </div>
                            <div className="text-base font-bold">
                                {report.type?.name ?? 'Emergency'}
                            </div>
                            <div className="line-clamp-3 text-sm text-slate-600">
                                {report.description}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <StatusBadge status={report.status} />
                                <span>
                                    {pluralize(
                                        report.people_affected,
                                        'person',
                                        'people',
                                    )}
                                </span>
                                <span>· {timeAgo(report.reported_at)}</span>
                            </div>
                            <Link
                                to={`/responder/requests/${report.id}`}
                                className="block rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white! hover:bg-slate-700"
                            >
                                Open request
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </BaseMap>
    );
}

/** Zoom to the pins once, so later polling does not reset the responder's view. */
function FitToReports({ reports }: { reports: LocatedReport[] }) {
    const map = useMap();
    const hasFitted = useRef(false);

    useEffect(() => {
        if (hasFitted.current || reports.length === 0) {
            return;
        }

        map.fitBounds(
            L.latLngBounds(
                reports.map((report) => [
                    report.location.latitude,
                    report.location.longitude,
                ]),
            ),
            { padding: [48, 48], maxZoom: 15 },
        );
        hasFitted.current = true;
    }, [map, reports]);

    return null;
}
