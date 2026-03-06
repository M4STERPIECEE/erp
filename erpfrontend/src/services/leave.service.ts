import api from "./employee.service";
import type { AdminLeaveResponse, AdminLeaveStats } from "../types/leave.types";

export async function getAllLeaves(): Promise<AdminLeaveResponse[]> {
  const { data } = await api.get<AdminLeaveResponse[]>("/leaves");
  return data;
}

export async function getAdminLeaveStats(): Promise<AdminLeaveStats> {
  const { data } = await api.get<AdminLeaveStats>("/leaves/admin-stats");
  return data;
}

export async function approveLeave(id: number): Promise<void> {
  await api.put(`/leaves/${id}/approve`);
}

export async function rejectLeave(id: number): Promise<void> {
  await api.put(`/leaves/${id}/reject`);
}
