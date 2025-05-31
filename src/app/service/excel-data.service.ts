import { Injectable } from '@angular/core';
import { FilaConsolidado } from '../models/fila-consolidado';
import { TecnicoVentasAgrupadas } from '../models/tecnico-venta-agrupada';
import { EstadoOCAgrupada } from '../models/estado-oc-agrupada';
import { CiudadAgrupadoVentas } from '../models/ciudad-agrupado-ventas';
import { SupervisorVentasAgrupadas } from '../models/supervisor-venta-agrupada';
import { DescripcionVentasAgrupadas } from '../models/servicio-venta-agrupada';

@Injectable({
  providedIn: 'root'
})
export class ExcelDataService {

  private excelData: FilaConsolidado[] = [];

  constructor() { }

  //Guardar archivo excel
  setExcelData(data: FilaConsolidado[]) {
    this.excelData = data;
  }

  //Obtener archivo excel
  getExcelData(): FilaConsolidado[] {
    return this.excelData;
  }

  getExcelDataFacturado(): FilaConsolidado[] {
    return this.excelData.filter(e => e.EstadoOrdenCompra === 'FACTURADO');
  }

  getExcelDataPendiente(): FilaConsolidado[] {
    return this.excelData.filter(e => e.EstadoOrdenCompra === 'PENDIENTE');
  }

  getExcelDataPorRegion(): CiudadAgrupadoVentas[] {
    const ventasPorCiudadMap: { [key: string]: { CantidadRegistro: number; MontoSinIGv: number; MontoConIGV: number } } = {};

    const filteredData = this.excelData.filter(e =>
      e.Ciudad !== undefined &&
      e.Ciudad !== null &&
      e.Ciudad.trim() !== '' &&
      typeof e.Monto === 'number' && !isNaN(e.Monto) &&
      typeof e.MontoIGV === 'number' && !isNaN(e.MontoIGV)
    );

    filteredData.forEach(item => {
      const ciudad = item.Ciudad.trim();

      if (!ventasPorCiudadMap[ciudad]) {
        ventasPorCiudadMap[ciudad] = { CantidadRegistro: 0, MontoSinIGv: 0, MontoConIGV: 0 };
      }

      ventasPorCiudadMap[ciudad].MontoSinIGv += item.Monto;
      ventasPorCiudadMap[ciudad].MontoConIGV += item.MontoIGV;
      ventasPorCiudadMap[ciudad].CantidadRegistro += 1;
    });

    const result: CiudadAgrupadoVentas[] = Object.keys(ventasPorCiudadMap).map(ciudad => ({
      Ciudad: ciudad,
      CantidadRegistro: ventasPorCiudadMap[ciudad].CantidadRegistro,
      MontoSinIGv: ventasPorCiudadMap[ciudad].MontoSinIGv,
      MontoConIGV: ventasPorCiudadMap[ciudad].MontoConIGV
    }));

    return result;
  }

  getExcelDataFacturadoTecnico(): TecnicoVentasAgrupadas[] {

    const ventasPorTecnicoMap: { [key: string]: { totalMonto: number; totalMontoIGV: number; totalOrdenes: number } } = {};

    const filteredData = this.excelData.filter(e =>
      e.EstadoOrdenCompra === 'FACTURADO'
      && e.TenicoAsignado !== undefined
      && e.TenicoAsignado !== null
      && e.TenicoAsignado.trim() !== ''
      && typeof e.Monto === 'number' && !isNaN(e.Monto)
      && typeof e.MontoIGV === 'number' && !isNaN(e.MontoIGV)
    );

    filteredData.forEach(item => {
      const tecnico = item.TenicoAsignado;
      const monto = item.Monto;
      const montoIGV = item.MontoIGV;

      const tecnicosArray = tecnico.split(',').map(t => t);
      tecnicosArray.forEach(t => {
        if (!ventasPorTecnicoMap[t]) {
          ventasPorTecnicoMap[t] = { totalMonto: 0, totalMontoIGV: 0, totalOrdenes: 0 };
        }
        ventasPorTecnicoMap[t].totalMonto += (monto / tecnicosArray.length);
        ventasPorTecnicoMap[t].totalMontoIGV += (montoIGV / tecnicosArray.length);
        ventasPorTecnicoMap[t].totalOrdenes += (1 / tecnicosArray.length);
      });
    });

    const result: TecnicoVentasAgrupadas[] = Object.keys(ventasPorTecnicoMap).map(tecnico => ({
      tecnico: tecnico,
      totalMonto: ventasPorTecnicoMap[tecnico].totalMonto,
      totalMontoIGV: ventasPorTecnicoMap[tecnico].totalMontoIGV,
      totalOrdenes: ventasPorTecnicoMap[tecnico].totalOrdenes
    }));

    return result;

  }

  getExcelDataFacturadoSupervisor(): SupervisorVentasAgrupadas[] {

    const ventasPorSupervisorMap: { [key: string]: { totalMonto: number; totalMontoIGV: number; totalOrdenes: number } } = {};

    const filteredData = this.excelData.filter(e =>
      e.EstadoOrdenCompra === 'FACTURADO'
      && e.TenicoAsignado !== undefined
      && e.TenicoAsignado !== null
      && e.TenicoAsignado.trim() !== ''
      && typeof e.Monto === 'number' && !isNaN(e.Monto)
      && typeof e.MontoIGV === 'number' && !isNaN(e.MontoIGV)
    );

    filteredData.forEach(item => {
      const supervisor = item.Supervisor;
      const monto = item.Monto;
      const montoIGV = item.MontoIGV;

      const supervisorArray = supervisor.split(',').map(t => t);
      supervisorArray.forEach(t => {
        if (!ventasPorSupervisorMap[t]) {
          ventasPorSupervisorMap[t] = { totalMonto: 0, totalMontoIGV: 0, totalOrdenes: 0 };
        }
        ventasPorSupervisorMap[t].totalMonto += (monto / supervisorArray.length);
        ventasPorSupervisorMap[t].totalMontoIGV += (montoIGV / supervisorArray.length);
        ventasPorSupervisorMap[t].totalOrdenes += (1 / supervisorArray.length);
      });
    });

    const result: SupervisorVentasAgrupadas[] = Object.keys(ventasPorSupervisorMap).map(supervisor => ({
      supervisor: supervisor,
      totalMonto: ventasPorSupervisorMap[supervisor].totalMonto,
      totalMontoIGV: ventasPorSupervisorMap[supervisor].totalMontoIGV,
      totalOrdenes: ventasPorSupervisorMap[supervisor].totalOrdenes
    }));

    return result;

  }

  getExcelDataFacturadoServicio(): CiudadAgrupadoVentas[] {
     const ventasPorCiudadMap: { [key: string]: { CantidadRegistro: number; MontoSinIGv: number; MontoConIGV: number } } = {};

    const filteredData = this.excelData.filter(e =>
      e.Ciudad !== undefined &&
      e.Ciudad !== null &&
      e.Ciudad.trim() !== '' &&
      typeof e.Monto === 'number' && !isNaN(e.Monto) &&
      typeof e.MontoIGV === 'number' && !isNaN(e.MontoIGV)
    );

    filteredData.forEach(item => {
      const ciudad = item.Ciudad.trim();

      if (!ventasPorCiudadMap[ciudad]) {
        ventasPorCiudadMap[ciudad] = { CantidadRegistro: 0, MontoSinIGv: 0, MontoConIGV: 0 };
      }

      ventasPorCiudadMap[ciudad].MontoSinIGv += item.Monto;
      ventasPorCiudadMap[ciudad].MontoConIGV += item.MontoIGV;
      ventasPorCiudadMap[ciudad].CantidadRegistro += 1;
    });

    const result: CiudadAgrupadoVentas[] = Object.keys(ventasPorCiudadMap).map(ciudad => ({
      Ciudad: ciudad,
      CantidadRegistro: ventasPorCiudadMap[ciudad].CantidadRegistro,
      MontoSinIGv: ventasPorCiudadMap[ciudad].MontoSinIGv,
      MontoConIGV: ventasPorCiudadMap[ciudad].MontoConIGV
    }));

    return result;
  }

  getExcelDataPorDescripcionServicio(): DescripcionVentasAgrupadas[] {
    const ventasPorDescripcionMap: { [key: string]: { totalMonto: number; totalMontoIGV: number; totalOrdenes: number } } = {};

    const SERVICIO_GRUPO_ELECTROGENO = 'ALQUILER DE GRUPO ELECTROGENO';
    const SERVICIO_LUCES_DETECTORES = 'LUCES DE EMEREGENCIA Y DETECTORES DE HUMO';
    const SERVICIO_POZO_TIERRA = 'PROTOCOLO DE POZO A TIERRA';
    const SERVICIO_OTROS = 'OTROS';

    const serviciosEspecificos = [
      SERVICIO_GRUPO_ELECTROGENO,
      SERVICIO_LUCES_DETECTORES,
      SERVICIO_POZO_TIERRA
    ];

    const filteredData = this.excelData.filter(e =>
      e.Descripcion !== undefined &&
      e.Descripcion !== null &&
      typeof e.Monto === 'number' && !isNaN(e.Monto) &&
      typeof e.MontoIGV === 'number' && !isNaN(e.MontoIGV)
    );

    filteredData.forEach(item => {
      const descripcionOriginal = item.Descripcion.trim().toUpperCase();

      let categoriaServicio: string;

      if (serviciosEspecificos.includes(descripcionOriginal)) {
        categoriaServicio = descripcionOriginal;
      } else {
        categoriaServicio = SERVICIO_OTROS;
      }

      if (!ventasPorDescripcionMap[categoriaServicio]) {
        ventasPorDescripcionMap[categoriaServicio] = { totalMonto: 0, totalMontoIGV: 0, totalOrdenes: 0 };
      }

      ventasPorDescripcionMap[categoriaServicio].totalMonto += item.Monto;
      ventasPorDescripcionMap[categoriaServicio].totalMontoIGV += item.MontoIGV;
      ventasPorDescripcionMap[categoriaServicio].totalOrdenes += 1;
    });

    const result: DescripcionVentasAgrupadas[] = Object.keys(ventasPorDescripcionMap).map(desc => ({
      descripcion: desc,
      totalMonto: ventasPorDescripcionMap[desc].totalMonto,
      totalMontoIGV: ventasPorDescripcionMap[desc].totalMontoIGV,
      totalOrdenes: ventasPorDescripcionMap[desc].totalOrdenes
    }));

    return result;
  }

  getExcelDataPorEstadoOC(): EstadoOCAgrupada[] {

    const ventasPorOCMap: { [key: string]: { totalMonto: number; totalMontoIGV: number; totalOrdenes: number } } = {};

    const filteredData = this.excelData.filter(e =>
      typeof e.Monto === 'number' && !isNaN(e.Monto)
      && typeof e.MontoIGV === 'number' && !isNaN(e.MontoIGV)
    );

    filteredData.forEach(item => {
      const estadoOC = item.EstadoOrdenCompra;
      const monto = item.Monto;
      const montoIGV = item.MontoIGV;

      const estadoOCArray = estadoOC.split(',').map(t => t);
      estadoOCArray.forEach(t => {
        if (!ventasPorOCMap[t]) {
          ventasPorOCMap[t] = { totalMonto: 0, totalMontoIGV: 0, totalOrdenes: 0 };
        }
        ventasPorOCMap[t].totalMonto += (monto / estadoOCArray.length);
        ventasPorOCMap[t].totalMontoIGV += (montoIGV / estadoOCArray.length);
        ventasPorOCMap[t].totalOrdenes += (1 / estadoOCArray.length);
      });
    });

    const result: EstadoOCAgrupada[] = Object.keys(ventasPorOCMap).map(estadoOC => ({
      estadoOC: estadoOC,
      totalMonto: ventasPorOCMap[estadoOC].totalMonto,
      totalMontoIGV: ventasPorOCMap[estadoOC].totalMontoIGV,
      totalOrdenes: ventasPorOCMap[estadoOC].totalOrdenes
    }));

    return result;

  }

  //Limpiar datos
  limpiarExcelData() {
    this.excelData = [];
  }
}
