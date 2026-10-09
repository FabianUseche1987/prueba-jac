import { RowDataPacket } from 'mysql2';

// Junta tal como la envía la API (camelCase).
// Es la misma forma que usa el frontend en junta.model.ts.
export interface Junta {
  idJunta: number;
  nombre: string;
  barrio: string;
  municipio: string;
  departamento: string | null;
  nit: string | null;
  representanteLegal: string | null;
  fechaFundacion: string | null;  // 'AAAA-MM-DD'
  estado: 'activa' | 'inactiva';
}

// Columnas que se leen de la tabla `junta` (siempre las mismas, en este orden)
export const COLUMNAS_JUNTA = `
  id_junta, nombre, barrio, municipio, departamento, nit,
  representante_legal, fecha_fundacion, estado`;

// Convierte una fila de la BD (snake_case) en una Junta (camelCase)
export function filaAJunta(fila: RowDataPacket): Junta {
  return {
    idJunta: fila.id_junta,
    nombre: fila.nombre,
    barrio: fila.barrio,
    municipio: fila.municipio,
    departamento: fila.departamento,
    nit: fila.nit,
    representanteLegal: fila.representante_legal,
    fechaFundacion: fila.fecha_fundacion,
    estado: fila.estado,
  };
}
