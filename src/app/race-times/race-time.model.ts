export interface RaceTime {
  id: string; // uuid
  corredor: string;
  carro: string;
  tiempoSegundos: number; // tiempo total en segundos
  tramo: string;
  fecha: string; // ISO string
}
