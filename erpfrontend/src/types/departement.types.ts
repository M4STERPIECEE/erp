export interface DepartementResponse {
  id: number;
  nom: string;
  description: string | null;
  responsableId: number | null;
  responsableNom: string | null;
  nombreEmployes: number;
}

export interface CreateDepartementRequest {
  nom: string;
  description?: string;
  responsableId?: number | null;
}
