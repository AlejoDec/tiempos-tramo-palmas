export interface RaceTime {
  id: string; // uuid
  corredor: string;
  carro: string; // modelo
  marca?: string; // nueva propiedad (puede faltar en registros antiguos)
  tiempoSegundos: number; // tiempo total en segundos
  tramo: string;
  fecha: string; // ISO string
}
