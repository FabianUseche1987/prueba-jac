import { RowDataPacket } from 'mysql2';

// Reunión o asamblea tal como la envía la API (camelCase)
export interface Reunion {
  idReunion: number;
  idJunta: number;
  tipo: string | null;            // ordinaria | extraordinaria | directiva
  titulo: string;
  ordenDelDia: string | null;     // un punto por línea
  fechaHora: string;              // 'AAAA-MM-DDTHH:MM:SS' (hora de Colombia)
  lugar: string | null;
  modalidad: string | null;       // presencial | virtual | mixta
  estado: string;                 // programada | realizada | cancelada
  actaResumen: string | null;
  quorumRequerido: number | null;
  creadaPor: string;              // nombre de quien la convocó
}

// Convierte una fila de la BD (snake_case) en una Reunion (camelCase)
export function filaAReunion(fila: RowDataPacket): Reunion {
  return {
    idReunion: fila.id_reunion,
    idJunta: fila.id_junta,
    tipo: fila.tipo,
    titulo: fila.titulo,
    ordenDelDia: fila.orden_del_dia,
    // La BD entrega '2026-10-10 18:00:00'; con la "T" el navegador la lee sin dudas
    fechaHora: String(fila.fecha_hora).replace(' ', 'T'),
    lugar: fila.lugar,
    modalidad: fila.modalidad,
    estado: fila.estado,
    actaResumen: fila.acta_resumen,
    quorumRequerido: fila.quorum_requerido,
    creadaPor: fila.creada_por,
  };
}
