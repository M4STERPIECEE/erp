// ─── Enums ──────────────────────────────────────────────────────────────────

export const CONTRAT_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE"] as const;
export type ContratType = (typeof CONTRAT_TYPES)[number];

export const STATUT_TYPES = ["ACTIF", "INACTIF", "SUSPENDU"] as const;
export type StatutType = (typeof STATUT_TYPES)[number];

export const ROLE_TYPES = ["employe", "rh", "admin"] as const;
export type RoleType = (typeof ROLE_TYPES)[number];

// ─── API Response : single employee ─────────────────────────────────────────

export interface EmployeeResponse {
  id: number;
  keycloakId: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  dateNaissance: string | null; // ISO date "YYYY-MM-DD"
  dateEmbauche: string;         // ISO date
  poste: string;
  statut: StatutType;
  departementId: number | null;
  typeContrat: string | null;
  salaireBase: number | null;
}

// ─── API Response : paginated list ──────────────────────────────────────────

export interface PagedEmployeeResponse {
  content: EmployeeResponse[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page (0-indexed)
  size: number;
}

// ─── API Request : create employee ──────────────────────────────────────────

export interface CreateEmployeeRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  dateEmbauche: string;
  poste: string;
  departementId: number;
  typeContrat: string;
  salaireBase: number;
  role: string;
}

// ─── Query params for GET /api/employes ─────────────────────────────────────

export interface GetEmployesParams {
  page?: number;
  size?: number;
  search?: string;
  departement?: number;
  statut?: string;
}

// ─── Static departement list (until GET /api/departements exists) ───────────

export interface Departement {
  id: number;
  nom: string;
}

export const DEPARTEMENTS: Departement[] = [
  { id: 1, nom: "Informatique" },
  { id: 2, nom: "Ressources Humaines" },
  { id: 3, nom: "Marketing" },
  { id: 4, nom: "Finance" },
];
