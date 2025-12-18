import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import rutasData from '../mock/rutas.json';

@Injectable({
  providedIn: 'root'
})
export class RutasService {

  constructor() { }

  getRutasAll(): Observable<any[]> {
    return of(rutasData.rutas);
  }

  getRutaById(id: number): Observable<any> {
    const ruta = rutasData.rutas.find(r => r.id === id);
    return of(ruta);
  }

  getRutaByCodigo(codigo: string): Observable<any> {
    const ruta = rutasData.rutas.find(r => r.codigo === codigo);
    return of(ruta);
  }
}