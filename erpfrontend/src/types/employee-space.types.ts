export interface MyProfileResponse {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  dateNaissance: string | null;
  dateEmbauche: string;
  poste: string;
  statut: string;
  departement: string | null;
  contractType: string | null;
  salaireBase: number | null;
  dateDebutContrat: string | null;
  dateFinContrat: string | null;
}

export const LEAVE_TYPE_OPTIONS = ["ANNUEL", "MALADIE", "MATERNITE", "SANS_SOLDE"] as const;
export type LeaveType = (typeof LEAVE_TYPE_OPTIONS)[number];

export const LEAVE_STATUS_OPTIONS = ["EN_ATTENTE", "APPROUVE", "REJETE"] as const;
export type LeaveStatus = (typeof LEAVE_STATUS_OPTIONS)[number];

export interface LeaveResponse {
  id: number;
  type: LeaveType;
  dateDebut: string;
  dateFin: string;
  joursOuvrables: number;
  motif: string | null;
  statut: LeaveStatus;
  dateDemande: string;
}

export interface LeaveRequest {
  type: LeaveType;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

export interface LeaveStatsResponse {
  joursUtilises: number;
  joursRestants: number;
  demandesEnAttente: number;
}

export interface AbsenceResponse {
  id: number;
  date: string;
  motif: string | null;
  justifiee: boolean;
}

export interface PayslipResponse {
  id: number;
  mois: number;
  annee: number;
  salaireBase: number;
  deductionAbsences: number;
  primePresence: number;
  cotisationsTotal: number;
  salaireNet: number;
  statut: string;
}
