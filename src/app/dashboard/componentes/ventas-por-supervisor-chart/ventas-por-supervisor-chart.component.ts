import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ExcelDataService } from '../../../service/excel-data.service';
import { SupervisorVentasAgrupadas } from '../../../models/supervisor-venta-agrupada';

@Component({
  selector: 'app-ventas-por-supervisor-chart',
  standalone: true,
  imports: [],
  templateUrl: './ventas-por-supervisor-chart.component.html',
  styleUrl: './ventas-por-supervisor-chart.component.css'
})
export class VentasPorSupervisorChartComponent {
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
    const data: SupervisorVentasAgrupadas[] = this.excelDataService.getExcelDataFacturadoSupervisor();
    if (data && data.length > 0) {
      this.processDataForChart(data);
    } else {
      console.warn('VentasPorTecnicoChartComponent: El servicio devolvió datos vacíos para Ventas por Técnico (Facturado).');
    }
  }

  private processDataForChart(rawData: SupervisorVentasAgrupadas[]): void {
    const ventasPorSupervisor: { [key: string]: number } = {};

    rawData.forEach(item => {
      const supervisor = item.supervisor;
      const monto = item.totalMontoIGV;
      const totalOrdenes = item.totalOrdenes;

      if (supervisor && typeof monto === 'number' && !isNaN(monto)) {
        const supervisorArray = supervisor.split(',').map(t => t.trim());
        supervisorArray.forEach(t => {
          ventasPorSupervisor[t] = (ventasPorSupervisor[t] || 0) + (monto / supervisorArray.length);
        });
      } else {
        console.warn(`VentasPorSupervisorChartComponent: Ítem omitido debido a datos inválidos: Supervisor='${supervisor}', Monto='${monto}'`, item); // <--- LOG
      }
    });

    const labels = Object.keys(ventasPorSupervisor);
    const data = Object.values(ventasPorSupervisor);

    if (labels.length === 0 || data.length === 0) {
        console.warn('VentasPorSupervisorChartComponent: No hay datos procesados para el gráfico. Labels o Data están vacíos.');
        if (this.myChart) {
            this.myChart.destroy(); 
            this.myChart = undefined;
        }
        return; 
    }

    if (this.myChart) {
      this.myChart.data.labels = labels;
      this.myChart.data.datasets[0].data = data;
      this.myChart.update();
    } else {
      this.createChart(labels, data);
    }
  }

  private generateColors(numColors: number): string[] {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 137.508) % 360;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  }

  private createChart(labels: string[], data: number[]): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const backgroundColors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monto Total Incl. IGV',
          data: data,
          backgroundColor: backgroundColors,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
          },
          title: {
            display: false,
            text: 'Distribución de Ventas por Supervisor'
          },
          tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'S/.' }).format(context.parsed);
                    }
                    return label;
                },
                afterLabel: function(context) {
                    const total = (context.dataset.data as number[]).reduce((sum: number, value: number) => sum + value, 0);
                    const currentValue = context.parsed;
                    const percentage = parseFloat(((currentValue as number) / total * 100).toFixed(2));
                    return `(${percentage}%)`;
                }
            }
          }
        }
      }
    };

    this.myChart = new Chart(ctx, config);
  }
}
