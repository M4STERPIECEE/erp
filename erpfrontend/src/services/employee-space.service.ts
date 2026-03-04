import api from "./employee.service";
import type {
  MyProfileResponse,
  LeaveResponse,
  LeaveRequest,
  LeaveStatsResponse,
  AbsenceResponse,
  PayslipResponse,
} from "../types/employee-space.types";

export async function getMyProfile(): Promise<MyProfileResponse> {
  const { data } = await api.get<MyProfileResponse>("/employes/me");
  return data;
}

export async function getMyLeaves(): Promise<LeaveResponse[]> {
  const { data } = await api.get<LeaveResponse[]>("/conges/mes-conges");
  return data;
}

export async function requestLeave(payload: LeaveRequest): Promise<LeaveResponse> {
  const { data } = await api.post<LeaveResponse>("/conges", payload);
  return data;
}

export async function cancelLeave(id: number): Promise<void> {
  await api.delete(`/conges/${id}`);
}

export async function getLeaveStats(): Promise<LeaveStatsResponse> {
  const { data } = await api.get<LeaveStatsResponse>("/conges/stats");
  return data;
}

export async function getMyAbsences(mois?: number, annee?: number): Promise<AbsenceResponse[]> {
  const params: Record<string, number> = {};
  if (mois !== undefined) params.mois = mois;
  if (annee !== undefined) params.annee = annee;
  const { data } = await api.get<AbsenceResponse[]>("/absences/mes-absences", { params });
  return data;
}

export async function getMyPayslips(): Promise<PayslipResponse[]> {
  const { data } = await api.get<PayslipResponse[]>("/paie/mes-fiches");
  return data;
}

export async function downloadPayslipPdf(id: number): Promise<Blob> {
  const { data } = await api.get(`/paie/${id}/pdf`, { responseType: "blob" });
  return data;
}
