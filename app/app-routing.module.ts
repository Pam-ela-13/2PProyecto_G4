import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapaPage } from './pages/mapa/mapa.page';

const routes: Routes = [
  { path: '', redirectTo: '/mapa', pathMatch: 'full' },
  { path: 'mapa', component: MapaPage }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }