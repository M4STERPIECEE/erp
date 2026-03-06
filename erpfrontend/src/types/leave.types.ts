import type { LeaveStatus, LeaveType } from "./employee-space.types";

export interface AdminLeaveResponse {
  id: number;
  type: LeaveType;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  statut: LeaveStatus;
  motif: string | null;
  employeId: number;
  employeNom: string;
  employePrenom: string;
  employePoste: string;
}

export interface AdminLeaveStats {
  pending: number;
  approved: number;
  onLeaveToday: number;
  plannedThisMonth: number;
}
