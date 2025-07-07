export interface ProblemCategory {
    id: number; // O un UUID string si prefieres
    name: string; // Nombre de la categoría (bache, vandalismo, etc.)
    description: string;
    icon?: string; // Nombre del ícono (ej. 'warning', 'delete_sweep') o ruta
    color?: string; // Código hexadecimal del color (ej. '#FF0000')
  }