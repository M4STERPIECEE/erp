export const CONTRACT_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];
export const STATUS_TYPES = ["ACTIF", "INACTIF", "SUSPENDU"] as const;
export type StatusType = (typeof STATUS_TYPES)[number];
export const ROLE_TYPES = ["employe", "rh", "admin"] as const;
export type RoleType = (typeof ROLE_TYPES)[number];
export interface EmployeeResponse {
  id: number;
  keycloakId: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  dateNaissance: string | null;
  dateEmbauche: string;
  poste: string;
  statut: StatusType;
  departementId: number | null;
  contractType: string | null;
  salaireBase: number | null;
}

export interface PagedEmployeeResponse {
  content: EmployeeResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CreateEmployeeRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  dateEmbauche: string;
  poste: string;
  departementId: number;
  contractType: string;
  salaireBase: number;
  dateFinContrat?: string;
  role: string;
}

export interface GetEmployeesParams {
  page?: number;
  size?: number;
  search?: string;
  departement?: number;
  statut?: string;
}

export interface Department {
  id: number;
  nom: string;
}

export const DEPARTMENTS: Department[] = [
  { id: 1, nom: "Informatique" },
  { id: 2, nom: "Ressources Humaines" },
  { id: 3, nom: "Marketing" },
  { id: 4, nom: "Finance" },
];
