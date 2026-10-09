// Reunión o asamblea, tal como la envía la API (basada en la tabla `reunion`)
export interface Reunion {
  idReunion: number;
  idJunta: number;
  tipo: string | null;            // ordinaria | extraordinaria | directiva
  titulo: string;
  ordenDelDia: string | null;     // un punto por línea
  fechaHora: string;              // 'AAAA-MM-DDTHH:MM:SS'
  lugar: string | null;
  modalidad: string | null;       // presencial | virtual | mixta
  estado: string;                 // programada | realizada | cancelada
  actaResumen: string | null;
  quorumRequerido: number | null;
  creadaPor: string;              // nombre de quien la convocó
}
