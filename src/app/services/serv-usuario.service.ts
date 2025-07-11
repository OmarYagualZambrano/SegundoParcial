import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, UsuarioCreateDto } from '../models/Usuario';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServUsuarioService {
  private url = 'https://localhost:7241/api/usuarios';

  constructor(private httpcliente: HttpClient) {}
//GET
  getUsuarios(): Observable<Usuario[]> {
    return this.httpcliente.get<Usuario[]>(this.url);
  }
  
  editUsuarios(usuario: Usuario): Observable<Usuario> {
    let urlUsuario = `${this.url}/${usuario.id}`;
    return this.httpcliente.put<Usuario>(urlUsuario, usuario);
  }
  //Editado usando el Dto
  addUsuarios(usuario: Usuario): Observable<Usuario> {   
    return this.httpcliente.post<Usuario>(this.url, usuario);
  }
  
  getUsuarioSearch(nombre?: string): Observable<Usuario[]> {
    return this.httpcliente.get<Usuario[]>(this.url).pipe(
      map((usuario) =>
        usuario.filter(
          (usuario) =>
            (nombre
              ? usuario.nombre.toLowerCase().includes(nombre.toLowerCase())
              : true) || 
            (nombre
              ? usuario.apellido.toLowerCase().includes(nombre.toLowerCase())
              : true)
        )
      )
    );
  }


  deleteUsuario(usuario: Usuario): Observable<void> {
    let urlUsuario = `${this.url}/${usuario.id}`;
    return this.httpcliente.delete<void>(urlUsuario);
  }

  getUsuarioById(id: string): Observable<Usuario> {
  return this.httpcliente.get<Usuario>(`${this.url}/${id}`);
}
}
