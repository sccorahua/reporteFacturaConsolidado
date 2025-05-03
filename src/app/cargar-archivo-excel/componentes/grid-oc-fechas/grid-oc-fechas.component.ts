import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FilaConsolidado } from '../../../models/fila-consolidado';

@Component({
  selector: 'app-grid-oc-fechas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    NgbModalModule,
  ],
  templateUrl: './grid-oc-fechas.component.html',
  styleUrl: './grid-oc-fechas.component.css'
})
export class GridOcFechasComponent implements OnChanges {
  @Input() reporteConsolidadoFecha: FilaConsolidado[] = [];
  @Output() retrocederOpcionReporte = new EventEmitter<void>();
  @ViewChild('modalDetalles') modalDetalles: any;

  detalleFila!: FilaConsolidado;

  reporteConsolidadoFechaGrid: FilaConsolidado[] = [];

  filtroSupervisor = new FormControl<string>('null');
  filtroFechaInicio = new FormControl<string>('null');
  filtroFechaFin = new FormControl<string>('null');

  listaSupervisor: string[] = [];
  listaCentroCosto: string[] = [];
  listaDescripcionServicio: string[] = [];

  montoConIGV: number = 0;
  montoSinIGV: number = 0;
  cantidadRegistros: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reporteConsolidadoFecha'] && this.reporteConsolidadoFecha?.length > 0) {
      this.reporteConsolidadoFechaGrid = this.reporteConsolidadoFecha;
      this.cargarFltros();
      this.actualizarCabecera();
    }
  }

  constructor(
      private modalService: NgbModal,
    ) {
    }
  
    ngOnInit() {
    }
  
    filtrarReporte() {
      this.reporteConsolidadoFechaGrid = this.reporteConsolidadoFecha;
  
      if (this.filtroSupervisor.value !== 'null') {
        this.reporteConsolidadoFechaGrid = this.reporteConsolidadoFechaGrid.filter(item => item.Supervisor === this.filtroSupervisor.value);
      }
      if(this.filtroFechaInicio.value && this.filtroFechaFin.value){
        const fechaInicio = new Date(this.filtroFechaInicio.value);
        const fechaFin = new Date(this.filtroFechaFin.value);
        this.reporteConsolidadoFechaGrid = this.reporteConsolidadoFechaGrid.filter(item => {
          const fecha = new Date(item.FecServicio);
          return fecha >= fechaInicio && fecha <= fechaFin;
        }); 
      }
  
      this.actualizarCabecera();
    }
  
    cargarFltros() {
      this.cargarFiltroSupervisor();
      this.cargarFiltroCentroCosto();
      this.cargarFiltroDescripcionServicio();
    }
  
    cargarFiltroSupervisor() {
      this.listaSupervisor = [...new Set(this.reporteConsolidadoFecha.map(item => item.Supervisor))];
    }
  
    cargarFiltroCentroCosto() {
      this.listaCentroCosto = [...new Set(this.reporteConsolidadoFecha.map(item => item.CentroCosto))];
    }
  
    cargarFiltroDescripcionServicio() {
      this.listaDescripcionServicio = [...new Set(this.reporteConsolidadoFecha.map(item => item.Descripcion))];
    }
  
    actualizarCabecera() {
      this.montoConIGV = this.reporteConsolidadoFechaGrid.reduce((total, item) => total + item.MontoIGV, 0);
      this.montoSinIGV = this.reporteConsolidadoFechaGrid.reduce((total, item) => total + item.Monto, 0);
      this.cantidadRegistros = this.reporteConsolidadoFechaGrid.length;
    }
  
    verDetalles(fila: FilaConsolidado) {
      this.detalleFila = fila;
      this.modalService.open(this.modalDetalles, { size: 'lg' });
    }
  
    retroceder(){
      this.retrocederOpcionReporte.emit();
    }
}
