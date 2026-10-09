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

// Datos que envía el formulario para convocar o editar una reunión
export interface DatosReunion {
  titulo: string;
  tipo: string;
  fechaHora: string;              // 'AAAA-MM-DDTHH:MM' (lo que da el campo de fecha y hora)
  lugar: string | null;
  modalidad: string;
  estado: string;
  ordenDelDia: string | null;
  actaResumen: string | null;
  quorumRequerido: number | null;
}
