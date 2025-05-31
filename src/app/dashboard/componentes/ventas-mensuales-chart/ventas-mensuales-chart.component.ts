import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ExcelDataService } from '../../../service/excel-data.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { FilaConsolidado } from '../../../models/fila-consolidado';

@Component({
  selector: 'app-ventas-mensuales-chart',
  standalone: true,
  imports: [],
  templateUrl: './ventas-mensuales-chart.component.html',
  styleUrl: './ventas-mensuales-chart.component.css'
})
export class VentasMensualesChartComponent implements AfterViewInit, OnDestroy {

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
    const data: FilaConsolidado[] = this.excelDataService.getExcelDataFacturado();

    if (data && data.length > 0) {
      this.processDataForChart(data);
    } else {
      console.warn('El servicio devolvió datos vacíos para Ventas Mensuales. Asegúrate de que el Excel se haya cargado.');
    }
  }

  private processDataForChart(rawData: FilaConsolidado[]): void {
    const monthlySales: { [key: string]: number } = {};

    rawData.forEach(item => {
      const date = new Date(item.FecServicio);

      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida encontrada en F_ENVIO_PSTO: '${item.FecServicio}'. Este ítem será omitido.`);
        return;
      }

      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlySales[yearMonth] = (monthlySales[yearMonth] || 0) + item.MontoIGV;
    });

    const labels = Object.keys(monthlySales).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    const data = labels.map(label => monthlySales[label]);

    if (this.myChart) {
      this.myChart.data.labels = labels;
      this.myChart.data.datasets[0].data = data;
      this.myChart.update();
    } else {
      this.createChart(labels, data);
    }
  }

  private createChart(labels: string[], data: number[]): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Error: No se pudo obtener el contexto 2D del canvas.');
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas Mensuales',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: false,
              text: 'Monto Total Incl. IGV'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Ventas Mensuales'
          }
        }
      }
    };

    this.myChart = new Chart(ctx, config);
  }
}
