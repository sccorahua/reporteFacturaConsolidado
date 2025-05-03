export interface FilaConsolidado {
    FecEnvioPresupuesto: Date;
    FecServicio: Date;
    TicketAranda: number;
    TicketCerrado: boolean;
    DiasRetraso: number;
    RazonSocial: string;
    OrdenCompra: string;
    Factura: string;
    CentroCosto: string;
    Local: string;
    Descripcion: string;
    HorasAlquiladas: string;
    Supervisor: string;
    Ciudad: string;
    Monto: number;
    MontoIGV: number;
    EstadoOrdenCompra: string;
    MedioPago: string;
    TenicoAsignado: string;
}