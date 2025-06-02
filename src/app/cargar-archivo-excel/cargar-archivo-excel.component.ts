import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { FilaConsolidado } from '../models/fila-consolidado';
import { GridOcFacturadoComponent } from './componentes/grid-oc-facturado/grid-oc-facturado.component';
import { GridOcPendienteComponent } from './componentes/grid-oc-pendiente/grid-oc-pendiente.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { GridOcFechasComponent } from './componentes/grid-oc-fechas/grid-oc-fechas.component';
import { GraphEstadisticasComponent } from './componentes/graph-estadisticas/graph-estadisticas.component';
import { VentaPorCiudad } from '../models/ventas-ubicacion';
import { ExcelDataService } from '../service/excel-data.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-cargar-archivo-excel',
  templateUrl: './cargar-archivo-excel.component.html',
  standalone: true,
  imports: [
    HeaderComponent,
    DatePipe,
    JsonPipe,
    CommonModule,
    NgbModalModule,
  ],
  styleUrl: './cargar-archivo-excel.component.css'
})

export class CargarArchivoExcelComponent {

  @ViewChild('modalConfirmacion') modalConfirmacion: any;

  fechaHoy: Date = new Date();
  nombreUsuario: string = 'Lerith';
  archivoCargado: boolean = false;

  reporteConsolidado: FilaConsolidado[] = [];

  reporteConsolidadoPagado: FilaConsolidado[] = [];
  reporteConsolidadoDeuda: FilaConsolidado[] = [];
  reporteConsolidadoFecha: FilaConsolidado[] = [];

  ventasCiudades: VentaPorCiudad[] = [];

  reporteConsolidadoPagadoVer: boolean = false;
  reporteConsolidadoDeudaVer: boolean = false;
  reporteConsolidadoFechaVer: boolean = false;
  graficaEstadisticasVer: boolean = false;

  excelData: any[] = [];

  constructor(
    private modalService: NgbModal,
    private excelDataService: ExcelDataService,
  ) { }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;

    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Primera hoja
      const sheet = workbook.Sheets[sheetName];
      this.excelData = XLSX.utils.sheet_to_json(sheet);
    };
    reader.readAsArrayBuffer(file);
  }

  procesarExcel() {
    this.limpiarRegistros();
    let fila!: FilaConsolidado;
    const procesarExcelData : FilaConsolidado[] = []; // Array temporal



    this.excelData.forEach(item => {
      const fechaEnvio = item['F_ENVIO_PSTO'];
      const descripcionServicio = item['DESCRIPCION_DEL_SERVICIO'];
      const ciudad = item['CIUDAD'];

      if (fechaEnvio === null || fechaEnvio === undefined || fechaEnvio === '') {
        return;
      }

      if (descripcionServicio === null || descripcionServicio === undefined || descripcionServicio === '') {
        return;
      }

      if (ciudad === null || ciudad === undefined || ciudad === '') {
        return;
      }

      fila = {
        FecEnvioPresupuesto: this.excelDateToJSDate(fechaEnvio),
        FecServicio: this.excelDateToJSDate(item['FECHA_SERVICIO']),
        TicketAranda: item['TICKET_ARANDA'],
        TicketCerrado: item['TICKET_CERRADO'] === 'SI',
        DiasRetraso: item['DIAS_RETRASO_OC'],
        RazonSocial: item['RAZON_SOCIAL'],
        OrdenCompra: item['O/C'],
        Factura: item['FACTURA'],
        CentroCosto: item['CENTRO_DE_COSTO'],
        Local: item['LOCAL'],
        Descripcion: descripcionServicio, //item['DESCRIPCION_DEL_SERVICIO'],
        HorasAlquiladas: item['HORAS_ALQUILADAS'],
        Supervisor: item['SUPERVISOR'],
        Ciudad: ciudad, //si no tiene ciudad no se considera en el calculo
        Monto: item['MONTO'],
        MontoIGV: item['MONTO_INC_IGV'],
        EstadoOrdenCompra: item['ESTADO_O/C'],
        MedioPago: item['MEDIO_DE_PAGO'],
        TenicoAsignado: item['TECNICOS_A_CARGO'] === undefined?("No asignado"):(item['TECNICOS_A_CARGO'])
      };

      procesarExcelData.push(fila);
    });

    this.reporteConsolidado = procesarExcelData;
    this.excelDataService.setExcelData(this.reporteConsolidado);

    this.archivoCargado = true;
    this.abrirModal();
    console.log(this.reporteConsolidado);    
  }

  limpiarRegistros() {
    this.reporteConsolidado = [];
  }

  abrirModal() {
    const modalRef = this.modalService.open(this.modalConfirmacion);
    let a = this.excelDataService.getExcelDataPorEstadoOC();
    console.log("DATOS ESTADO OC");
    console.log(a);
    setTimeout(() => modalRef.close(), 3000);
  }

  excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
  }
}
