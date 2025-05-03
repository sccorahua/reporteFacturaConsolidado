import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { FilaConsolidado } from '../models/fila-consolidado';
import { GridOcFacturadoComponent } from './componentes/grid-oc-facturado/grid-oc-facturado.component';
import { GridOcPendienteComponent } from './componentes/grid-oc-pendiente/grid-oc-pendiente.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { GridOcFechasComponent } from './componentes/grid-oc-fechas/grid-oc-fechas.component';

@Component({
  selector: 'app-cargar-archivo-excel',
  templateUrl: './cargar-archivo-excel.component.html',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    CommonModule,
    GridOcFacturadoComponent,
    GridOcPendienteComponent,
    GridOcFechasComponent,
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

  reporteConsolidadoPagadoVer: boolean = false;
  reporteConsolidadoDeudaVer: boolean = false;
  reporteConsolidadoFechaVer: boolean = false;

  excelData: any[] = [];

  constructor(
    private modalService: NgbModal,
  ) { }

  botones = [
    { titulo: 'O/C Pagados', accion: () => this.ocPagados() },
    { titulo: 'O/C con Deudas', accion: () => this.ocDeudas() },
    { titulo: 'Por fechas Monto Facturado', accion: () => this.montoFacturado() },
    { titulo: 'Tipo de Servicio', accion: () => this.tipoServicio() },
    { titulo: 'Nombre Técnico', accion:  () => this.nombreTecnico() },
  ];

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

    this.excelData.forEach(item => {
      const fechaEnvio = item['F_ENVIO_PSTO'];

      if (fechaEnvio === null || fechaEnvio === undefined || fechaEnvio === '') {
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
        Descripcion: item['DESCRIPCION_DEL_SERVICIO'],
        HorasAlquiladas: item['HORAS_ALQUILADAS'],
        Supervisor: item['SUPERVISOR'],
        Ciudad: item['CIUDAD'],
        Monto: item['MONTO'],
        MontoIGV: item['MONTO_INC_IGV'],
        EstadoOrdenCompra: item['ESTADO_O/C'],
        MedioPago: item['MEDIO_DE_PAGO'],
        TenicoAsignado: item['TECNICOS_A_CARGO']
      };

      this.reporteConsolidado.push(fila);
    })
    this.archivoCargado = true;
    this.abrirModal();
    console.log(this.reporteConsolidado);

  }

  ocPagados() {   
    this.reporteConsolidadoPagado = this.reporteConsolidado.filter(item => item.EstadoOrdenCompra === 'FACTURADO');
    this.reporteConsolidadoPagadoVer = true;

  }

  ocDeudas() {
    this.reporteConsolidadoDeuda = this.reporteConsolidado.filter(item => item.EstadoOrdenCompra === 'PENDIENTE');
    this.reporteConsolidadoDeudaVer = true;
  }

  montoFacturado() {
    this.reporteConsolidadoFecha = this.reporteConsolidado;
    this.reporteConsolidadoFechaVer = true;
  }

  tipoServicio() {
    console.log('Tipo de Servicio');
  }

  nombreTecnico() {
    console.log('Nombre Técnico');
  }

  limpiarRegistros() {
    this.reporteConsolidado = [];
  }

  abrirModal() {
    const modalRef = this.modalService.open(this.modalConfirmacion);
    setTimeout(() => modalRef.close(), 3000);
  }

  excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);  
    const utc_value = utc_days * 86400; 
    return new Date(utc_value * 1000);
  }

  retroceder() {
    this.archivoCargado = false;
    this.excelData = [];
    this.reporteConsolidado = [];
  }

  menuReportes(){
    this.reporteConsolidadoPagadoVer = false;
    this.reporteConsolidadoDeudaVer = false;
    this.reporteConsolidadoFechaVer = false;
  }
}
