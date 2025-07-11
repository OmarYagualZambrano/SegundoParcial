export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  cedula: string;
  usuario1: string;
  tipo_usuario: string;
  genero: string;
  direccion: string;
  contrasenia: string;
}
export interface UsuarioCreateDto {
  nombre: string;
  apellido: string;
  cedula: string;
  usuario1: string;
  tipo_usuario: string;
  genero: string;
  direccion: string;
  contrasenia: string;
}