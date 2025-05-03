import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FilaConsolidado } from '../../../models/fila-consolidado';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-grid-oc-pendiente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    NgbModalModule,
  ],
  templateUrl: './grid-oc-pendiente.component.html',
  styleUrl: './grid-oc-pendiente.component.css'
})
export class GridOcPendienteComponent implements OnChanges {
  @Input() reporteConsolidadoDeuda: FilaConsolidado[] = [];
  @Output() retrocederOpcionReporte = new EventEmitter<void>();
  @ViewChild('modalDetalles') modalDetalles: any;

  detalleFila!: FilaConsolidado;

  reporteConsolidadoDeudaGrid: FilaConsolidado[] = [];

  filtroSupervisor = new FormControl<string>('null');
  filtroCentroCosto = new FormControl<string>('null');
  filtroDescripcionServicio = new FormControl<string>('null');

  listaSupervisor: string[] = [];
  listaCentroCosto: string[] = [];
  listaDescripcionServicio: string[] = [];

  montoConIGV: number = 0;
  montoSinIGV: number = 0;
  cantidadRegistros: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reporteConsolidadoDeuda'] && this.reporteConsolidadoDeuda?.length > 0) {
      this.reporteConsolidadoDeudaGrid = this.reporteConsolidadoDeuda;
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
    this.reporteConsolidadoDeudaGrid = this.reporteConsolidadoDeuda;

    if (this.filtroSupervisor.value !== 'null') {
      this.reporteConsolidadoDeudaGrid = this.reporteConsolidadoDeudaGrid.filter(item => item.Supervisor === this.filtroSupervisor.value);
    }
    if (this.filtroCentroCosto.value !== 'null') {
      this.reporteConsolidadoDeudaGrid = this.reporteConsolidadoDeudaGrid.filter(item => item.CentroCosto === this.filtroCentroCosto.value);
    }
    if (this.filtroDescripcionServicio.value !== 'null') {
      this.reporteConsolidadoDeudaGrid = this.reporteConsolidadoDeudaGrid.filter(item => item.Descripcion === this.filtroDescripcionServicio.value);
    }

    this.actualizarCabecera();
  }

  cargarFltros() {
    this.cargarFiltroSupervisor();
    this.cargarFiltroCentroCosto();
    this.cargarFiltroDescripcionServicio();
  }

  cargarFiltroSupervisor() {
    this.listaSupervisor = [...new Set(this.reporteConsolidadoDeuda.map(item => item.Supervisor))];
  }

  cargarFiltroCentroCosto() {
    this.listaCentroCosto = [...new Set(this.reporteConsolidadoDeuda.map(item => item.CentroCosto))];
  }

  cargarFiltroDescripcionServicio() {
    this.listaDescripcionServicio = [...new Set(this.reporteConsolidadoDeuda.map(item => item.Descripcion))];
  }

  actualizarCabecera() {
    this.montoConIGV = this.reporteConsolidadoDeudaGrid.reduce((total, item) => total + item.MontoIGV, 0);
    this.montoSinIGV = this.reporteConsolidadoDeudaGrid.reduce((total, item) => total + item.Monto, 0);
    this.cantidadRegistros = this.reporteConsolidadoDeudaGrid.length;
  }

  verDetalles(fila: FilaConsolidado) {
    this.detalleFila = fila;
    this.modalService.open(this.modalDetalles, { size: 'lg' });
  }

  retroceder(){
    this.retrocederOpcionReporte.emit();
  }

}
