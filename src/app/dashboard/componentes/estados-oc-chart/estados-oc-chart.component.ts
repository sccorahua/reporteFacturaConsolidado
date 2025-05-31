import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ExcelDataService } from '../../../service/excel-data.service';
import { FilaConsolidado } from '../../../models/fila-consolidado';
import { EstadoOCAgrupada } from '../../../models/estado-oc-agrupada';

@Component({
  selector: 'app-estados-oc-chart',
  standalone: true,
  imports: [],
  templateUrl: './estados-oc-chart.component.html',
  styleUrl: './estados-oc-chart.component.css'
})
export class EstadosOcChartComponent {
@ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private myChart: Chart | undefined;

  constructor(private excelDataService: ExcelDataService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    if (this.myChart) {
      this.myChart.destroy();
    }
  }

  private loadChartData(): void {
    const data: EstadoOCAgrupada[] = this.excelDataService.getExcelDataPorEstadoOC();

    if (data && data.length > 0) {
      this.processDataForChart(data);
    } else {
      console.warn('El servicio devolvió datos vacíos para Estados OC. Asegúrate de que el Excel se haya cargado y los datos estén correctamente agrupados.');
    }
  }

  private processDataForChart(rawData: EstadoOCAgrupada[]): void {
    const labels: string[] = [];
    const dataMonto: number[] = [];
    const dataMontoIGV: number[] = [];

    rawData.forEach(item => {
      labels.push(item.estadoOC);
      dataMonto.push(item.totalMonto);
      dataMontoIGV.push(item.totalMontoIGV);
    });

    if (this.myChart) {
      this.myChart.data.labels = labels;
      this.myChart.data.datasets[0].data = dataMonto;
      this.myChart.data.datasets[1].data = dataMontoIGV;
      this.myChart.update();
    } else {
      this.createChart(labels, dataMonto, dataMontoIGV);
    }
  }

  private createChart(labels: string[], dataMonto: number[], dataMontoIGV: number[]): void {
    if (!this.chartCanvas) {
      console.error('Error: chartCanvas no está disponible. Asegúrate de que el elemento canvas exista en el HTML y que @ViewChild lo esté seleccionando correctamente.');
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Error: No se pudo obtener el contexto 2D del canvas.');
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels, 
        datasets: [
          {
            label: 'Ingresos (sin IGV)',
            data: dataMonto,
            backgroundColor: 'rgba(54, 162, 235, 0.6)', 
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Ingresos (con IGV)',
            data: dataMontoIGV,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Estado de Orden de Compra' 
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Monto Total' 
            }
          }
        },
        plugins: {
          legend: {
            display: true, 
            position: 'top',
          },
          title: {
            display: false,
            text: 'Ingresos por Estado de Orden de Compra' 
          }
        }
      }
    };

    this.myChart = new Chart(ctx, config);
  }
}
