import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { MapaPage } from './pages/mapa/mapa.page';

import { BusesService } from './services/buses.service';
import { RutasService } from './services/rutas.service';
import { ParaderosService } from './services/paraderos.service';
import { UbicacionService } from './services/ubicacion.service';

@NgModule({
  declarations: [
    AppComponent,
    MapaPage
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    BusesService,
    RutasService,
    ParaderosService,
    UbicacionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }