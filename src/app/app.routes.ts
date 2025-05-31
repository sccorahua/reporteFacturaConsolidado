import { Routes } from '@angular/router';
import { CargarArchivoExcelComponent } from './cargar-archivo-excel/cargar-archivo-excel.component';
import { PaginaInicioComponent } from './pagina-inicio/pagina-inicio.component';
import { GraphFacturadoComponent } from './dashboard/graph-facturado/graph-facturado.component';
import { GridOcFacturadoComponent } from './cargar-archivo-excel/componentes/grid-oc-facturado/grid-oc-facturado.component';
import { GridOcPendienteComponent } from './cargar-archivo-excel/componentes/grid-oc-pendiente/grid-oc-pendiente.component';

export const routes: Routes = [
  { path: '', component: PaginaInicioComponent, pathMatch: 'full' },
  { path: 'cargar-excel', component: CargarArchivoExcelComponent, pathMatch: 'full' },
  {path: 'dashboard/facturado', component: GraphFacturadoComponent, pathMatch: 'full'},
  {path: 'reportes/facturado', component: GridOcFacturadoComponent, pathMatch: 'full'},
  {path: 'reportes/pendiente', component: GridOcPendienteComponent, pathMatch: 'full'}

];