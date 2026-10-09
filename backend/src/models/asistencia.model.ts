import { RowDataPacket } from 'mysql2';
import { textoLimpio } from '../validaciones';

// Un miembro de la junta con su asistencia a una reunión (tabla `asistencia`)
export interface FilaAsistencia {
  idUsuario: number;
  nombre: string;
  rol: string;
  asistio: boolean | null;       // null = todavía no se ha registrado
  horaLlegada: string | null;    // 'HH:MM'
  justificacion: string | null;  // por qué no asistió
}

export function filaAAsistencia(fila: RowDataPacket): FilaAsistencia {
  return {
    idUsuario: fila.id_usuario,
    nombre: fila.nombre,
    rol: fila.nombre_rol,
    asistio: fila.asistio === null ? null : fila.asistio === 1,
    horaLlegada: fila.hora_llegada ? String(fila.hora_llegada).slice(0, 5) : null,  // '18:05:00' -> '18:05'
    justificacion: fila.justificacion,
  };
}

// ----- Validación -----

// Lo que envía el directivo al guardar la asistencia
export interface RegistroAsistencia {
  idUsuario: number;
  asistio: boolean;
  horaLlegada: string | null;
  justificacion: string | null;
}

function esHoraValida(texto: string): boolean {
  const partes = /^(\d{2}):(\d{2})(:\d{2})?$/.exec(texto);
  return !!partes && Number(partes[1]) < 24 && Number(partes[2]) < 60;
}

// Revisa { asistencia: [ { idUsuario, asistio, horaLlegada, justificacion }, ... ] }
export function validarAsistencia(body: Record<string, unknown>): { registros: RegistroAsistencia[] | null; errores: string[] } {
  const errores: string[] = [];
  const lista = body.asistencia;

  if (!Array.isArray(lista) || lista.length === 0) {
    return { registros: null, errores: ['Envía la lista de asistencia'] };
  }

  const registros: RegistroAsistencia[] = [];
  const vistos = new Set<number>();

  for (const item of lista as Record<string, unknown>[]) {
    const idUsuario = Number(item?.idUsuario);
    const horaLlegada = textoLimpio(item?.horaLlegada);
    const justificacion = textoLimpio(item?.justificacion);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      errores.push('Hay una persona con un id inválido');
      continue;
    }
    if (vistos.has(idUsuario)) {
      errores.push('Una persona aparece dos veces en la lista');
      continue;
    }
    vistos.add(idUsuario);

    if (typeof item.asistio !== 'boolean') errores.push('Indica si cada persona asistió o no');
    if (horaLlegada && !esHoraValida(horaLlegada)) errores.push('Hay una hora de llegada inválida (formato HH:MM)');
    if (justificacion && justificacion.length > 500) errores.push('La justificación admite máximo 500 caracteres');

    registros.push({
      idUsuario,
      asistio: item.asistio === true,
      // Si asistió no tiene justificación; si no asistió no tiene hora de llegada
      horaLlegada: item.asistio === true ? horaLlegada : null,
      justificacion: item.asistio === true ? null : justificacion,
    });
  }

  if (errores.length > 0) {
    return { registros: null, errores: [...new Set(errores)] };  // sin mensajes repetidos
  }
  return { registros, errores };
}
