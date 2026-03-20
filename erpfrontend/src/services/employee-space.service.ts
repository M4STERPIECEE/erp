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
  const { data } = await api.get<MyProfileResponse>("/employees/me");
  return data;
}

export async function getMyLeaves(): Promise<LeaveResponse[]> {
  const { data } = await api.get<LeaveResponse[]>("/leaves/my-leaves");
  return data;
}

export async function requestLeave(payload: LeaveRequest): Promise<LeaveResponse> {
  const { data } = await api.post<LeaveResponse>("/leaves", payload);
  return data;
}

export async function cancelLeave(id: number): Promise<void> {
  await api.delete(`/leaves/${id}`);
}

export async function getLeaveStats(): Promise<LeaveStatsResponse> {
  const { data } = await api.get<LeaveStatsResponse>("/leaves/stats");
  return data;
}

export async function getMyAbsences(mois?: number, annee?: number): Promise<AbsenceResponse[]> {
  const params: Record<string, number> = {};
  if (mois !== undefined) params.mois = mois;
  if (annee !== undefined) params.annee = annee;
  const { data } = await api.get<AbsenceResponse[]>("/absences/my-absences", { params });
  return data;
}

export async function getMyPayslips(): Promise<PayslipResponse[]> {
  const { data } = await api.get<PayslipResponse[]>("/payroll/my-payslips");
  return data;
}

export async function downloadPayslipPdf(id: number): Promise<Blob> {
  const { data } = await api.get(`/payroll/${id}/pdf`, { responseType: "blob" });
  return data;
}
