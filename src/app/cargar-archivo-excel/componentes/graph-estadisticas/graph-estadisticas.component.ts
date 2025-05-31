import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import * as L from 'leaflet';
import { isPlatformBrowser } from '@angular/common';
import { FilaConsolidado } from '../../../models/fila-consolidado';

interface VentaPorCiudad {
  CIUDAD: string;
  VOLUMEN_VENTAS: number;
  // ... otros campos de tu Excel
}

@Component({
  selector: 'app-graph-estadisticas',
  standalone: true,
  imports: [],
  templateUrl: './graph-estadisticas.component.html',
  styleUrl: './graph-estadisticas.component.css'
})

export class GraphEstadisticasComponent implements AfterViewInit {
  @Input() reporteConsolidadoPagado: FilaConsolidado[] = [];
  @Output() retrocederOpcionReporte = new EventEmitter<void>();

  map: any;
  L: any;

  ventasCiudades: VentaPorCiudad[] = [
    { CIUDAD: 'LIMA', VOLUMEN_VENTAS: 15000 },
    { CIUDAD: 'SAN JUAN DE LURIGANCHO', VOLUMEN_VENTAS: 8000 },
    { CIUDAD: 'VILL MARIA DEL TRIUNFO', VOLUMEN_VENTAS: 5500 },
    { CIUDAD: 'AREQUIPA', VOLUMEN_VENTAS: 12000 },
  ];
  cityCoordinates: { [key: string]: [number, number] } = {
    'LIMA': [-12.0464, -77.0428],
    'SAN JUAN DE LURIGANCHO': [-12.0333, -76.9833],
    'VILL MARIA DEL TRIUNFO': [-12.1667, -76.9333],
    'AREQUIPA': [-16.3929, -71.5325],
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const L = await import('leaflet');
      this.L = L;

      // filepath: c:\SCCORAHUA\ProyectoL\pagina-reportes\src\app\cargar-archivo-excel\componentes\graph-estadisticas\graph-estadisticas.component.ts
      this.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'assets/leaflet/images/marker-icon-2x.png',
        iconUrl: 'assets/leaflet/images/marker-icon.png',
        shadowUrl: 'assets/leaflet/images/marker-shadow.png',
      });

      this.initMap();
      this.addSalesMarkers();
    }
  }

  private initMap(): void {
    this.map = this.L.map('mapaVentas', {
      center: [-10, -75],
      zoom: 6
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '...'
    }).addTo(this.map);
  }

  private addSalesMarkers(): void {
    this.ventasCiudades.forEach(venta => {
      const ciudad = venta.CIUDAD;
      const volumenVentas = venta.VOLUMEN_VENTAS;
      const coordenadas = this.cityCoordinates[ciudad];

      if (coordenadas) {
        const marker = this.L.marker(coordenadas).bindPopup(`Ciudad: ${ciudad}<br>Ventas: S/ ${volumenVentas.toLocaleString()}`);
        marker.addTo(this.map);
      } else {
        console.warn(`Coordenadas no encontradas para: ${ciudad}`);
      }
    });
  }

}
