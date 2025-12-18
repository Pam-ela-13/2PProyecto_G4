import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import busesData from '../mock/buses.json';

@Injectable({
  providedIn: 'root'
})
export class BusesService {
  private busesSubject = new BehaviorSubject<any[]>(busesData.buses);
  public buses$ = this.busesSubject.asObservable();

  constructor() {
    this.iniciarSimulacion();
  }

  getBusesAll(): Observable<any[]> {
    return this.buses$;
  }

  getBusById(id: number): Observable<any> {
    return this.buses$.pipe(
      map(buses => buses.find(bus => bus.id === id))
    );
  }

  getBusesByRuta(rutaId: number): Observable<any[]> {
    return this.buses$.pipe(
      map(buses => buses.filter(bus => bus.rutaId === rutaId))
    );
  }

  private iniciarSimulacion(): void {
    interval(5000).subscribe(() => {
      this.actualizarPosiciones();
    });
  }

  private actualizarPosiciones(): void {
    const busesActuales = this.busesSubject.value;
    const busesActualizados = busesActuales.map(bus => {
      if (bus.estado === 'en_ruta') {
        return this.moverBus(bus);
      }
      return bus;
    });
    this.busesSubject.next(busesActualizados);
  }

  private moverBus(bus: any): any {
    const velocidadKmH = bus.velocidad;
    const velocidadGradosPorSegundo = (velocidadKmH / 111000) * 5;
    
    const variacionLat = (Math.random() - 0.5) * velocidadGradosPorSegundo * 2;
    const variacionLng = (Math.random() - 0.5) * velocidadGradosPorSegundo * 2;

    const nuevaUbicacion = {
      lat: bus.ubicacion.lat + variacionLat,
      lng: bus.ubicacion.lng + variacionLng
    };

    const variacionVelocidad = (Math.random() - 0.5) * 10;
    const nuevaVelocidad = Math.max(15, Math.min(50, bus.velocidad + variacionVelocidad));

    const variacionOcupacion = Math.floor((Math.random() - 0.5) * 6);
    const nuevaOcupacion = Math.max(0, Math.min(bus.capacidad, bus.ocupacionActual + variacionOcupacion));

    const tiempoReducido = Math.max(0, bus.tiempoEstimadoProximoParadero - 1);

    return {
      ...bus,
      ubicacion: nuevaUbicacion,
      velocidad: nuevaVelocidad,
      ocupacionActual: nuevaOcupacion,
      tiempoEstimadoProximoParadero: tiempoReducido
    };
  }
}