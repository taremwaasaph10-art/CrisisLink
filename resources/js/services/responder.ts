import { api, queryString } from '@/services/api';
import type { ApiEnvelope } from '@/services/api';
import type {
    DashboardData,
    EmergencyReport,
    Paginated,
    PaginationMeta,
    ReportPriority,
    ReportStatus,
    User,
} from '@/types';

/** Status groups matching the dashboard's summary cards. */
export type StatusGroup = 'active' | 'pending_verification' | 'with_responder';

export type ReportFilters = {
    status?: ReportStatus | StatusGroup | '';
    priority?: ReportPriority | '';
    emergency_type_id?: number | string;
    search?: string;
    page?: number;
    per_page?: number;
};

export type NewResponder = {
    name: string;
    email: string;
    phone?: string;
    password: string;
};

type ActionResult = { report: EmergencyReport; message: string };

function toActionResult(response: ApiEnvelope<EmergencyReport>): ActionResult {
    return { report: response.data, message: response.message };
}

/** Endpoints used by responders and admins. */
export const responderService = {
    async dashboard(): Promise<DashboardData> {
        return (await api.get<DashboardData>('/responder/dashboard')).data;
    },

    async reports(
        filters: ReportFilters = {},
    ): Promise<Paginated<EmergencyReport>> {
        const response = await api.get<EmergencyReport[]>(
            `/responder/emergency-reports${queryString(filters)}`,
        );

        return {
            data: response.data,
            meta: response.meta as PaginationMeta,
        };
    },

    async find(id: number | string): Promise<EmergencyReport> {
        return (
            await api.get<EmergencyReport>(`/responder/emergency-reports/${id}`)
        ).data;
    },

    async responders(): Promise<User[]> {
        return (await api.get<User[]>('/responder/responders')).data;
    },

    async startReview(id: number): Promise<ActionResult> {
        return responderService.updateStatus(id, 'under_review');
    },

    async verify(
        id: number,
        priority: ReportPriority,
        note?: string,
    ): Promise<ActionResult> {
        return toActionResult(
            await api.patch<EmergencyReport>(
                `/responder/emergency-reports/${id}/verify`,
                { priority, note: note || null },
            ),
        );
    },

    async assign(
        id: number,
        responderId: number,
        notes?: string,
    ): Promise<ActionResult> {
        return toActionResult(
            await api.patch<EmergencyReport>(
                `/responder/emergency-reports/${id}/assign`,
                { responder_id: responderId, notes: notes || null },
            ),
        );
    },

    async updateStatus(
        id: number,
        status: Extract<
            ReportStatus,
            'under_review' | 'in_progress' | 'resolved'
        >,
        note?: string,
    ): Promise<ActionResult> {
        return toActionResult(
            await api.patch<EmergencyReport>(
                `/responder/emergency-reports/${id}/status`,
                { status, note: note || null },
            ),
        );
    },

    async updatePriority(
        id: number,
        priority: ReportPriority,
    ): Promise<ActionResult> {
        return toActionResult(
            await api.patch<EmergencyReport>(
                `/responder/emergency-reports/${id}/priority`,
                { priority },
            ),
        );
    },

    async createResponder(responder: NewResponder): Promise<User> {
        return (await api.post<User>('/admin/responders', responder)).data;
    },
};
