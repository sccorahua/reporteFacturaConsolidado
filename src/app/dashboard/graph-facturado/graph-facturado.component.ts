import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { VentaPorCiudad } from '../../models/ventas-ubicacion';
import { isPlatformBrowser } from '@angular/common';
import { ExcelDataService } from '../../service/excel-data.service';
import { FilaConsolidado } from '../../models/fila-consolidado';
import { VentasMensualesChartComponent } from '../componentes/ventas-mensuales-chart/ventas-mensuales-chart.component';
import { VentasPorTecnicoChartComponent } from '../componentes/ventas-por-tecnico-chart/ventas-por-tecnico-chart.component';
import { EstadosOcChartComponent } from '../componentes/estados-oc-chart/estados-oc-chart.component';
import { GridRegionComponent } from '../componentes/grid-region/grid-region.component';
import { VentasPorSupervisorChartComponent } from '../componentes/ventas-por-supervisor-chart/ventas-por-supervisor-chart.component';
import { VentasPorServicioChartComponent } from '../componentes/ventas-por-servicio-chart/ventas-por-servicio-chart.component';

@Component({
  selector: 'app-graph-facturado',
  standalone: true,
  imports: [
    VentasMensualesChartComponent,
    VentasPorTecnicoChartComponent,
    EstadosOcChartComponent,
    GridRegionComponent,
    VentasPorSupervisorChartComponent,
    VentasPorServicioChartComponent
  ],
  templateUrl: './graph-facturado.component.html',
  styleUrl: './graph-facturado.component.css'
})
export class GraphFacturadoComponent implements OnInit {
  map: any;

  excelData: FilaConsolidado[] = [];
  ventasCiudades: VentaPorCiudad[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private excelDataService: ExcelDataService,
  ) { }

  ngOnInit(): void {
    this.procesarExcelData();
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const L = await import('leaflet');

      L.Marker.prototype.options.icon = L.icon({
        iconRetinaUrl: 'marker-icon-2x.png',
        iconUrl: 'marker-icon.png',
        shadowUrl: 'marker-shadow.png',
        iconSize: [25, 41], 
        iconAnchor: [12, 41], 
        popupAnchor: [1, -34], 
        shadowSize: [41, 41] 
      });
      this.initMap(L);
      this.addSalesMarkers(L);
    }
  }

  private initMap(L: any): void {
    this.map = L.map('mapaVentas', { // Usa L directamente
      center: [-10, -75],
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Usa L directamente
      maxZoom: 18,
      attribution: '...'
    }).addTo(this.map);
  }

  private addSalesMarkers(L: any): void {
    this.ventasCiudades.forEach(venta => {
      const ciudad = venta.Ciudad;
      const volumenVentas = venta.VolumenVentas;
      const latitude = venta.latitude;
      const longitude = venta.longitude;

      if (latitude !== null && longitude !== null) {
        const coordenadas: L.LatLngExpression = [latitude, longitude];
        const marker = L.marker(coordenadas).bindPopup(`Ciudad: ${ciudad}<br>Ventas: S/ ${volumenVentas.toLocaleString()}`); // Usa L directamente
        marker.addTo(this.map);
      } else {
        console.warn(`Coordenadas no encontradas para: ${ciudad}`);
      }
    });
  }
  async procesarExcelData() {
    this.excelData = this.excelDataService.getExcelDataFacturado();

    const agrupado: { [ciudad: string]: number } = {};

    this.excelData.forEach(item => {
      if (agrupado[item.Ciudad]) {
        agrupado[item.Ciudad] += item.Monto;
      } else {
        agrupado[item.Ciudad] = item.Monto;
      }
    });

    this.ventasCiudades = Object.entries(agrupado).map(([Ciudad, VolumenVentas]) => ({
      Ciudad,
      VolumenVentas,
      latitude: null,
      longitude: null,
      error: undefined
    } as VentaPorCiudad));

    await Promise.all(
      this.ventasCiudades.map(async (ciudadVenta) => {
        try {
          const coordenadas = await this.obtenerLatitudLongitud(ciudadVenta.Ciudad + " Peru");
          ciudadVenta.latitude = coordenadas.latitude;
          ciudadVenta.longitude = coordenadas.longitude;
        } catch (error) {
          console.error(`Error al obtener coordenadas para ${ciudadVenta.Ciudad}:`, error);
          ciudadVenta.latitude = null;
          ciudadVenta.longitude = null;
          ciudadVenta.error = '';
        }
      })
    );
  }

  async obtenerLatitudLongitud(direccion: string): Promise<{ latitude: number, longitude: number }> {
    const apiUrl = `/nominatim/search?q=${encodeURIComponent(direccion)}&format=jsonv2&limit=1`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error en la petición a Nominatim: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const primerResultado = data[0];
        return {
          latitude: parseFloat(primerResultado.lat),
          longitude: parseFloat(primerResultado.lon),
        };
      } else {
        throw new Error(`No se encontraron resultados para la dirección: ${direccion}`);
      }
    } catch (error) {
      console.error(`Error al obtener latitud y longitud para "${direccion}":`, error);
      throw error;
    }
  }
}

