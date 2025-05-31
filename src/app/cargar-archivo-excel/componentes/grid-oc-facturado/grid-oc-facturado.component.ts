import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FilaConsolidado } from '../../../models/fila-consolidado';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, NgSelectOption, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TablaFiltroFacturadoPipe } from '../../pipes/tabla-filtro-facturado.pipe';
import { ExcelDataService } from '../../../service/excel-data.service';

@Component({
  selector: 'app-grid-oc-facturado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    NgbModalModule,
    NgSelectModule,
    TablaFiltroFacturadoPipe,
    FormsModule
  ],
  templateUrl: './grid-oc-facturado.component.html',
  styleUrl: './grid-oc-facturado.component.css'
})
export class GridOcFacturadoComponent implements OnChanges {

  @ViewChild('modalDetalles') modalDetalles: any;

  detalleFila!: FilaConsolidado;
  detalleFilaParaEdicion: any = {};

  reporteConsolidadoPagado: FilaConsolidado[] = [];
  reporteConsolidadoPagadoGrid: FilaConsolidado[] = [];

  filtroSupervisor = new FormControl<string>('null');
  filtroCentroCosto = new FormControl<string[]>([]);
  filtroDescripcionServicio = new FormControl<string[]>([]);

  listaSupervisor: string[] = [];
  listaCentroCosto: string[] = [];
  listaDescripcionServicio: string[] = [];

  montoConIGV: number = 0;
  montoSinIGV: number = 0;
  cantidadRegistros: number = 0;

  textoBusqueda: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reporteConsolidadoPagado'] && this.reporteConsolidadoPagado?.length > 0) {
      this.reporteConsolidadoPagadoGrid = this.reporteConsolidadoPagado;
      this.cargarFltros();
    }
  }

  constructor(
    private modalService: NgbModal,
    private excelDataService: ExcelDataService,
  ) {

  }

  ngOnInit() {
    this.cargarData();
    this.cargarFltros();
    this.actualizarCabecera();
  }

  cargarData() {
    this.reporteConsolidadoPagado = this.excelDataService.getExcelDataFacturado();
    this.reporteConsolidadoPagadoGrid = this.reporteConsolidadoPagado;
  }

  filtrarReporte() {
    this.reporteConsolidadoPagadoGrid = this.reporteConsolidadoPagado;

    if (this.filtroSupervisor.value !== 'null') {
      this.reporteConsolidadoPagadoGrid = this.reporteConsolidadoPagadoGrid.filter(item => item.Supervisor === this.filtroSupervisor.value);
    }
    if ((this.filtroCentroCosto.value ?? []).length > 0) {
      this.reporteConsolidadoPagadoGrid = this.reporteConsolidadoPagadoGrid.filter(item =>
        (this.filtroCentroCosto.value ?? []).includes(item.Descripcion)
      );
    }
    if ((this.filtroDescripcionServicio.value ?? []).length > 0) {
      this.reporteConsolidadoPagadoGrid = this.reporteConsolidadoPagadoGrid.filter(item =>
        (this.filtroDescripcionServicio.value ?? []).includes(item.Descripcion)
      );
    }

    this.actualizarCabecera();
  }

  cargarFltros() {
    this.cargarFiltroSupervisor();
    this.cargarFiltroCentroCosto();
    this.cargarFiltroDescripcionServicio();
    console.log(this.listaCentroCosto);

  }

  cargarFiltroSupervisor() {
    this.listaSupervisor = [...new Set(this.reporteConsolidadoPagado.map(item => item.Supervisor))];
  }

  cargarFiltroCentroCosto() {
    this.listaCentroCosto = [...new Set(this.reporteConsolidadoPagado.map(item => item.CentroCosto))];
  }

  cargarFiltroDescripcionServicio() {
    this.listaDescripcionServicio = [...new Set(this.reporteConsolidadoPagado.map(item => item.Descripcion))];
  }

  actualizarCabecera() {
    this.montoConIGV = this.reporteConsolidadoPagadoGrid.reduce((total, item) => total + item.MontoIGV, 0);
    this.montoSinIGV = this.reporteConsolidadoPagadoGrid.reduce((total, item) => total + item.Monto, 0);
    this.cantidadRegistros = this.reporteConsolidadoPagadoGrid.length;
  }


  verDetalles(fila: FilaConsolidado) {
    this.detalleFila = { ...fila };

    this.detalleFilaParaEdicion = {
      ...this.detalleFila,
      FecEnvioPresupuesto: this.formatDate(this.detalleFila.FecEnvioPresupuesto),
      FecServicio: this.formatDate(this.detalleFila.FecServicio)
    };
    this.modalService.open(this.modalDetalles, { size: 'lg' });
  }

  seleccionarTodosServicios(event: any): void {
    if (event.target.checked) {
      this.filtroDescripcionServicio.setValue([...this.listaDescripcionServicio]);
    } else {
      this.filtroDescripcionServicio.setValue([]);
    }
  }

  eliminarServicio(servicioAEliminar: string): void {
    const serviciosActuales = this.filtroDescripcionServicio.value as string[];
    const nuevosServicios = serviciosActuales.filter(servicio => servicio !== servicioAEliminar);
    this.filtroDescripcionServicio.setValue(nuevosServicios);
  }

  guardarCambios() {
    console.log('Datos modificados (copia):', this.detalleFilaParaEdicion);
    this.modalService.dismissAll();
  }

  formatDate(date: any): string {
    if (date) {
      const dateObject = new Date(date);
      const year = dateObject.getFullYear();
      const month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
      const day = ('0' + dateObject.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
    return '';
  }
}
