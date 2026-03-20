export interface DepartmentResponse {
  id: number;
  nom: string;
  description: string | null;
  responsableId: number | null;
  responsableNom: string | null;
  nombreEmployes: number;
}

export interface CreateDepartmentRequest {
  nom: string;
  description?: string;
  responsableId?: number | null;
}
