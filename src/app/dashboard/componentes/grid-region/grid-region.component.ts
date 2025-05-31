import { Component, OnInit } from '@angular/core';
import { ExcelDataService } from '../../../service/excel-data.service';
import { FilaConsolidado } from '../../../models/fila-consolidado';
import { CiudadAgrupadoVentas } from '../../../models/ciudad-agrupado-ventas';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grid-region',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './grid-region.component.html',
  styleUrl: './grid-region.component.css'
})
export class GridRegionComponent implements OnInit {

  dataExcel: CiudadAgrupadoVentas[] = [];
  paginatedData: CiudadAgrupadoVentas[] = [];

  pageSize: number = 8; 
  currentPage: number = 1; 
  totalPages: number = 1; 

  ngOnInit(): void {
    this.listarInformacionPorRegion();
  }

  constructor(
    private excelDataService: ExcelDataService,
  ) { }

  listarInformacionPorRegion() {
    this.dataExcel = this.excelDataService.getExcelDataPorRegion();
    this.calculatePagination();
    this.paginateData();
  }

  calculatePagination(): void {
    if (this.dataExcel && this.dataExcel.length > 0) {
      this.totalPages = Math.ceil(this.dataExcel.length / this.pageSize);
    } else {
      this.totalPages = 1;
    }
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  paginateData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.dataExcel.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateData();
    }
  }

  getTotalCantidadRegistro(): number {
    return this.dataExcel.reduce((sum, row) => sum + row.CantidadRegistro, 0);
  }

  getTotalMontoSinIGV(): number {
    return this.dataExcel.reduce((sum, row) => sum + row.MontoSinIGv, 0);
  }

  getTotalMontoConIGV(): number {
    return this.dataExcel.reduce((sum, row) => sum + row.MontoConIGV, 0);
  }

}
