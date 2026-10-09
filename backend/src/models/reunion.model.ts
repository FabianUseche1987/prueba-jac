import { RowDataPacket } from 'mysql2';
import { esFechaHoraValida, revisarLargo, textoLimpio } from '../validaciones';

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

// Consulta base: la reunión con el nombre de quien la convocó
export const SELECT_REUNION = `
  SELECT r.id_reunion, r.id_junta, r.tipo, r.titulo, r.orden_del_dia, r.fecha_hora, r.lugar,
         r.modalidad, r.estado, r.acta_resumen, r.quorum_requerido,
         CONCAT(TRIM(u.nombre), ' ', TRIM(u.apellido)) AS creada_por
  FROM reunion r
  JOIN usuario u ON u.id_usuario = r.id_creador`;

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

// ----- Validación -----

const TIPOS = ['ordinaria', 'extraordinaria', 'directiva'];
const MODALIDADES = ['presencial', 'virtual', 'mixta'];
const ESTADOS = ['programada', 'realizada', 'cancelada'];

// Datos que envía el formulario para convocar o editar una reunión
export interface DatosReunion {
  titulo: string;
  tipo: string;
  ordenDelDia: string | null;
  fechaHora: string;          // ya convertida para la BD: 'AAAA-MM-DD HH:MM:SS'
  lugar: string | null;
  modalidad: string;
  estado: string;
  actaResumen: string | null;
  quorumRequerido: number | null;
}

// Revisa los datos del formulario. Devuelve los datos limpios o la lista de errores.
export function validarDatosReunion(body: Record<string, unknown>): { datos: DatosReunion | null; errores: string[] } {
  const errores: string[] = [];

  const quorumVacio = body.quorumRequerido === null || body.quorumRequerido === undefined || body.quorumRequerido === '';
  const datos = {
    titulo: textoLimpio(body.titulo),
    tipo: textoLimpio(body.tipo) ?? 'ordinaria',
    ordenDelDia: textoLimpio(body.ordenDelDia),
    fechaHora: textoLimpio(body.fechaHora),
    lugar: textoLimpio(body.lugar),
    modalidad: textoLimpio(body.modalidad) ?? 'presencial',
    estado: textoLimpio(body.estado) ?? 'programada',
    actaResumen: textoLimpio(body.actaResumen),
    quorumRequerido: quorumVacio ? null : Number(body.quorumRequerido),
  };

  if (!datos.titulo) errores.push('El título es obligatorio');
  revisarLargo(errores, 'El título', datos.titulo, 200);
  revisarLargo(errores, 'El lugar', datos.lugar, 200);

  if (!datos.fechaHora) {
    errores.push('La fecha y la hora son obligatorias');
  } else if (!esFechaHoraValida(datos.fechaHora)) {
    errores.push('La fecha y la hora no son válidas');
  }

  if (!TIPOS.includes(datos.tipo)) errores.push('El tipo debe ser ordinaria, extraordinaria o directiva');
  if (!MODALIDADES.includes(datos.modalidad)) errores.push('La modalidad debe ser presencial, virtual o mixta');
  if (!ESTADOS.includes(datos.estado)) errores.push('El estado debe ser programada, realizada o cancelada');

  if (datos.quorumRequerido !== null && (!Number.isInteger(datos.quorumRequerido) || datos.quorumRequerido < 1)) {
    errores.push('El quórum debe ser un número entero mayor que 0');
  }

  if (errores.length > 0) {
    return { datos: null, errores };
  }

  // '2026-10-10T18:00' -> '2026-10-10 18:00:00' (formato DATETIME de la BD)
  const fechaHora = datos.fechaHora!.replace('T', ' ');
  return {
    datos: { ...datos, fechaHora: fechaHora.length === 16 ? `${fechaHora}:00` : fechaHora } as DatosReunion,
    errores,
  };
}
