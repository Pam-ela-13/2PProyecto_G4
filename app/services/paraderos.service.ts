import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import paraderosData from '../mock/paraderos.json';

@Injectable({
  providedIn: 'root'
})
export class ParaderosService {
  private paraderosSubject = new BehaviorSubject<any[]>(paraderosData.paraderos);
  public paraderos$ = this.paraderosSubject.asObservable();

  constructor() {
    this.actualizarTiemposEspera();
  }

  getParaderosAll(): Observable<any[]> {
    return this.paraderos$;
  }

  getParaderoById(id: number): Observable<any> {
    return this.paraderos$.pipe(
      map(paraderos => paraderos.find(p => p.id === id))
    );
  }

  getParaderosByRuta(rutaId: number): Observable<any[]> {
    return this.paraderos$.pipe(
      map(paraderos => paraderos.filter(p => p.rutasIds.includes(rutaId)))
    );
  }

  private actualizarTiemposEspera(): void {
    interval(10000).subscribe(() => {
      const paraderosActualizados = this.paraderosSubject.value.map(paradero => {
        const tiemposActualizados: any = {};
        Object.keys(paradero.tiemposEspera).forEach(rutaId => {
          const variacion = Math.floor((Math.random() - 0.5) * 4);
          tiemposActualizados[rutaId] = Math.max(1, Math.min(15, paradero.tiemposEspera[rutaId] + variacion));
        });
        return {
          ...paradero,
          tiemposEspera: tiemposActualizados
        };
      });
      this.paraderosSubject.next(paraderosActualizados);
    });
  }
}