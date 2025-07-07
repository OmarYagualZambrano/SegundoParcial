import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Zona } from '../models/zonas';

@Injectable({
  providedIn: 'root'
})
export class ServZonaService {
  jsonUrl: string;

  constructor(private http: HttpClient) { 
    this.jsonUrl = "http://localhost:3000/zonas";
  }
  
  //funcion para retornar todas las zonas
  getZonas():Observable<Zona[]> {
    return this.http.get<Zona[]>(this.jsonUrl);
  }
  
  actualizarZona(zona:Zona): Observable<Zona>{
    const url = `${this.jsonUrl}/${zona.id}`;
    return this.http.put<Zona>(url, zona);
  }



  eliminarZona(zona:Zona): Observable<any>{ 
    const url = `${this.jsonUrl}/${zona.id}`;
    return this.http.delete(url);
  }

  //funcion para crear una nueva zona
  crearZona(zona: any): Observable<any> {
    return this.http.post<any>(this.jsonUrl, zona);
  }
  
  getZonasPorCiudad(ciudad: string): Observable<Zona[]> {
    return this.http.get<Zona[]>(this.jsonUrl).pipe(
      map(zonas => {
        if (!ciudad) {
          return zonas;
        }
        const ciudadLower = ciudad.toLowerCase();
        return zonas.filter(zona =>
          zona.ciudad.toLowerCase().includes(ciudadLower)
        );
      })
    );
  }
}
