import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Respuestas } from '../models/Respuestas';
@Injectable({
  providedIn: 'root'
})
export class RespuestaService{
  private jsonUrl = 'http://localhost:3000/respuestas';

  constructor(private http: HttpClient) { }

  getRespuestas(): Observable<Respuestas[]> {
    return this.http.get<Respuestas[]>(this.jsonUrl);
  }

  getRespuestasByReporte(reporteId: number): Observable<Respuestas[]> {
    return this.http.get<Respuestas[]>(`${this.jsonUrl}?reporteId=${reporteId}`);
  }

  addRespuesta(respuesta: Respuestas): Observable<Respuestas> {
    return this.http.post<Respuestas>(this.jsonUrl, respuesta);
  }

  updateRespuesta(respuesta: Respuestas): Observable<Respuestas> {
    return this.http.put<Respuestas>(`${this.jsonUrl}/${respuesta.id}`, respuesta);
  }

  deleteRespuesta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.jsonUrl}/${id}`);
  }
  
  getReportesConRespuestas(): Observable<any[]> {
  return forkJoin([
    this.http.get<any[]>('http://localhost:3000/reportes'),
    this.http.get<any[]>('http://localhost:3000/respuestas')
  ]).pipe(
    map(([reportes, respuestas]) => {
  return reportes.map(reporte => {
    const respuesta = respuestas.find(r => 
      r.reporteId.toString() === reporte.id.toString()
    );
    
    return {
      id: reporte.id,
      titulo: reporte.titulo,
      categoria: reporte.categoria,
      funcionario: respuesta?.funcionario || '',
      mensaje: respuesta?.mensaje || '',
      estado: respuesta?.estado || 'Pendiente',
      fecha: respuesta?.fecha || '',
      reporteId: reporte.id,
      idRespuesta: respuesta?.id,
      tieneRespuesta: !!respuesta
    };
  });
})


  );
}
}