import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { BusesService } from '../../services/buses.service';
import { RutasService } from '../../services/rutas.service';
import { ParaderosService } from '../../services/paraderos.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss']
})
export class MapaPage implements OnInit, OnDestroy {
  private mapaInstance!: L.Map;
  private markersMap = new Map<number, L.Marker>();
  private paraderosMarkers: L.Marker[] = [];
  private polylines: L.Polyline[] = [];
  
  private subscriptions: Subscription[] = [];
  
  busesData: any[] = [];
  rutasData: any[] = [];
  paraderosData: any[] = [];
  
  rutaSeleccionadaId: number | null = null;
  cargandoMapa = true;

  constructor(
    private busesService: BusesService,
    private rutasService: RutasService,
    private paraderosService: ParaderosService
  ) { }

  ngOnInit(): void {
    this.inicializarMapa();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.mapaInstance) {
      this.mapaInstance.remove();
    }
  }

  private inicializarMapa(): void {
    setTimeout(() => {
      this.mapaInstance = L.map('mapa-container', {
        center: [-0.32500, -79.24000],
        zoom: 11
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.mapaInstance);

      this.cargandoMapa = false;
    }, 100);
  }

  private cargarDatos(): void {
    const busesSub = this.busesService.getBusesAll().subscribe(buses => {
      this.busesData = buses;
      this.actualizarMarkerssBuses(buses);
    });

    const rutasSub = this.rutasService.getRutasAll().subscribe(rutas => {
      this.rutasData = rutas;
    });

    const paraderosSub = this.paraderosService.getParaderosAll().subscribe(paraderos => {
      this.paraderosData = paraderos;
      this.mostrarParaderos(paraderos);
    });

    this.subscriptions.push(busesSub, rutasSub, paraderosSub);
  }

  private actualizarMarkerssBuses(buses: any[]): void {
    buses.forEach(bus => {
      if (bus.estado === 'fuera_servicio') {
        if (this.markersMap.has(bus.id)) {
          this.mapaInstance.removeLayer(this.markersMap.get(bus.id)!);
          this.markersMap.delete(bus.id);
        }
        return;
      }

      const iconBus = L.divIcon({
        className: 'custom-bus-icon',
        html: `<div class="bus-marker" style="background-color: ${this.getColorEstado(bus.estado)}">
                 <i class="fas fa-bus"></i>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      if (this.markersMap.has(bus.id)) {
        const marker = this.markersMap.get(bus.id)!;
        marker.setLatLng([bus.ubicacion.lat, bus.ubicacion.lng]);
        marker.setIcon(iconBus);
      } else {
        const marker = L.marker([bus.ubicacion.lat, bus.ubicacion.lng], { icon: iconBus })
          .addTo(this.mapaInstance);
        
        marker.bindPopup(this.crearPopupBus(bus));
        this.markersMap.set(bus.id, marker);
      }
    });
  }

  private mostrarParaderos(paraderos: any[]): void {
    this.paraderosMarkers.forEach(marker => this.mapaInstance.removeLayer(marker));
    this.paraderosMarkers = [];

    paraderos.forEach(paradero => {
      const iconParadero = L.divIcon({
        className: 'custom-paradero-icon',
        html: `<div class="paradero-marker">
                 <i class="fas fa-map-marker-alt"></i>
               </div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 25]
      });

      const marker = L.marker([paradero.ubicacion.lat, paradero.ubicacion.lng], { icon: iconParadero })
        .addTo(this.mapaInstance);
      
      marker.bindPopup(this.crearPopupParadero(paradero));
      this.paraderosMarkers.push(marker);
    });
  }

  private crearPopupBus(bus: any): string {
    const ocupacionPorcentaje = Math.round((bus.ocupacionActual / bus.capacidad) * 100);
    return `
      <div class="popup-bus">
        <h4>${bus.numeroUnidad}</h4>
        <p><strong>Placa:</strong> ${bus.placa}</p>
        <p><strong>Estado:</strong> ${this.getTextoEstado(bus.estado)}</p>
        <p><strong>Velocidad:</strong> ${bus.velocidad} km/h</p>
        <p><strong>Ocupación:</strong> ${bus.ocupacionActual}/${bus.capacidad} (${ocupacionPorcentaje}%)</p>
        <p><strong>Tiempo próximo paradero:</strong> ${bus.tiempoEstimadoProximoParadero} min</p>
      </div>
    `;
  }

  private crearPopupParadero(paradero: any): string {
    const tiemposHtml = Object.entries(paradero.tiemposEspera)
      .map(([rutaId, tiempo]) => `Ruta ${rutaId}: ${tiempo} min`)
      .join('<br>');
    
    return `
      <div class="popup-paradero">
        <h4>${paradero.nombre}</h4>
        <p><strong>Código:</strong> ${paradero.codigo}</p>
        <p><strong>Dirección:</strong> ${paradero.direccion}</p>
        <p><strong>Distrito:</strong> ${paradero.distrito}</p>
        <div class="tiempos-espera">
          <strong>Tiempos de espera:</strong><br>
          ${tiemposHtml}
        </div>
      </div>
    `;
  }

  seleccionarRuta(rutaId: number): void {
    this.rutaSeleccionadaId = rutaId;
    this.dibujarRuta(rutaId);
  }

  private dibujarRuta(rutaId: number): void {
    this.polylines.forEach(polyline => this.mapaInstance.removeLayer(polyline));
    this.polylines = [];

    const ruta = this.rutasData.find(r => r.id === rutaId);
    if (!ruta) return;

    const coordenadas = ruta.coordenadas.map((c: any) => [c.lat, c.lng] as [number, number]);
    const polyline = L.polyline(coordenadas, {
      color: ruta.color,
      weight: 4,
      opacity: 0.7
    }).addTo(this.mapaInstance);

    this.polylines.push(polyline);
    this.mapaInstance.fitBounds(polyline.getBounds());
  }

  limpiarRuta(): void {
    this.rutaSeleccionadaId = null;
    this.polylines.forEach(polyline => this.mapaInstance.removeLayer(polyline));
    this.polylines = [];
  }

  centrarEnBus(busId: number): void {
    const bus = this.busesData.find(b => b.id === busId);
    if (bus && this.markersMap.has(busId)) {
      this.mapaInstance.setView([bus.ubicacion.lat, bus.ubicacion.lng], 15);
      this.markersMap.get(busId)!.openPopup();
    }
  }

  private getColorEstado(estado: string): string {
    switch (estado) {
      case 'en_ruta': return '#28a745';
      case 'detenido': return '#ffc107';
      case 'fuera_servicio': return '#dc3545';
      default: return '#6c757d';
    }
  }

  private getTextoEstado(estado: string): string {
    switch (estado) {
      case 'en_ruta': return 'En Ruta';
      case 'detenido': return 'Detenido';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return 'Desconocido';
    }
  }
}