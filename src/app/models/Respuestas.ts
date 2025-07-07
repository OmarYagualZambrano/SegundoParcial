export interface Respuestas {
  id: number;
  reporteId: number;
  funcionario: string;
  mensaje: string;
  fecha: string;
  estado: 'Pendiente' | 'En revisión' | 'Resuelto' | 'Aviso';
  archivo?: string | null;
  problema?: string;
}