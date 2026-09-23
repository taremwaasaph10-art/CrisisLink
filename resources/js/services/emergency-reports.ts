import { api } from '@/services/api';
import type { EmergencyAlert, EmergencyReport, EmergencyType } from '@/types';

export type NewEmergencyReport = {
    emergency_type_id: number;
    description: string;
    people_affected: number;
    latitude: number | null;
    longitude: number | null;
    location_description: string;
    photo: File | null;
};

/** Endpoints used by citizens. */
export const emergencyReportService = {
    async types(): Promise<EmergencyType[]> {
        return (await api.get<EmergencyType[]>('/emergency-types')).data;
    },

    async alerts(): Promise<EmergencyAlert[]> {
        return (await api.get<EmergencyAlert[]>('/alerts')).data;
    },

    async mine(): Promise<EmergencyReport[]> {
        return (await api.get<EmergencyReport[]>('/emergency-reports')).data;
    },

    async find(id: number | string): Promise<EmergencyReport> {
        return (await api.get<EmergencyReport>(`/emergency-reports/${id}`))
            .data;
    },

    async submit(report: NewEmergencyReport): Promise<EmergencyReport> {
        const form = new FormData();
        form.append('emergency_type_id', String(report.emergency_type_id));
        form.append('description', report.description);
        form.append('people_affected', String(report.people_affected));
        form.append('location_description', report.location_description);

        if (report.latitude !== null && report.longitude !== null) {
            form.append('latitude', report.latitude.toFixed(7));
            form.append('longitude', report.longitude.toFixed(7));
        }

        if (report.photo) {
            form.append('photo', report.photo);
        }

        return (await api.post<EmergencyReport>('/emergency-reports', form))
            .data;
    },
};
