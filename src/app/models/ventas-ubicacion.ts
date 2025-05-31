export interface VentaPorCiudad {
  Ciudad: string;
  VolumenVentas: number;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}