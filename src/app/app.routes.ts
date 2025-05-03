import { Routes } from '@angular/router';
import { CargarArchivoExcelComponent } from './cargar-archivo-excel/cargar-archivo-excel.component';

export const routes: Routes = [
  { path: '', component: CargarArchivoExcelComponent, pathMatch: 'full' }
];