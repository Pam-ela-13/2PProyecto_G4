import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import ubicacionData from '../mock/ubicacion.json';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  constructor() { }

  getConfiguracion(): Observable<any> {
    return of(ubicacionData.configuracion);
  }

  getHistoricoByBus(busId: number): Observable<any[]> {
    const historico = ubicacionData.ubicacionesHistoricas.filter(u => u.busId === busId);
    return of(historico);
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}