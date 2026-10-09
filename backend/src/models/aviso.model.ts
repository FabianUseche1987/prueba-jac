import { RowDataPacket } from 'mysql2';
import { ZONA_HORARIA } from '../db';
import { esFechaHoraValida, revisarLargo, textoLimpio } from '../validaciones';

// Aviso de la junta tal como lo envía la API (tablas `notificacion` y `notificacion_usuario`)
export interface Aviso {
  idAviso: number;
  titulo: string;
  mensaje: string;
  tipo: string;                    // general | reunion | proyecto
  prioridad: string;               // alta | media | baja
  audiencia: string;               // todos | directivos
  fechaEnvio: string;              // 'AAAA-MM-DDTHH:MM:SS' (hora de Colombia)
  fechaExpiracion: string | null;  // después de esta fecha ya no se muestra
  remitente: string;
  leido: boolean;                  // si EL USUARIO que pregunta ya lo leyó
}

// Avisos que puede ver un usuario: de su junta, sin vencer, y los de "directivos"
// solo si es directivo. Parámetros, en orden: idUsuario, idJunta, perfil.
export const SELECT_AVISOS_VISIBLES = `
  SELECT n.id_notificacion, n.titulo, n.mensaje, n.tipo, n.prioridad, n.audiencia,
         n.fecha_envio, n.fecha_expiracion,
         CONCAT(TRIM(u.nombre), ' ', TRIM(u.apellido)) AS remitente,
         COALESCE(nu.leida, 0) AS leida
  FROM notificacion n
  JOIN usuario u ON u.id_usuario = n.id_remitente
  LEFT JOIN notificacion_usuario nu ON nu.id_notificacion = n.id_notificacion AND nu.id_usuario = ?
  WHERE n.id_junta = ?
    AND (n.audiencia = 'todos' OR ? = 'directivo')
    AND (n.fecha_expiracion IS NULL OR n.fecha_expiracion > NOW())`;

const conT = (valor: unknown) => (valor ? String(valor).replace(' ', 'T') : null);

export function filaAAviso(fila: RowDataPacket): Aviso {
  return {
    idAviso: fila.id_notificacion,
    titulo: fila.titulo,
    mensaje: fila.mensaje,
    tipo: fila.tipo ?? 'general',
    prioridad: fila.prioridad,
    audiencia: fila.audiencia,
    fechaEnvio: conT(fila.fecha_envio)!,
    fechaExpiracion: conT(fila.fecha_expiracion),
    remitente: fila.remitente,
    leido: Number(fila.leida) === 1,
  };
}

// ----- Validación -----

const TIPOS = ['general', 'reunion', 'proyecto'];
const PRIORIDADES = ['alta', 'media', 'baja'];
const AUDIENCIAS = ['todos', 'directivos'];

export interface DatosAviso {
  titulo: string;
  mensaje: string;
  tipo: string;
  prioridad: string;
  audiencia: string;
  fechaExpiracion: string | null;  // ya convertida para la BD: 'AAAA-MM-DD HH:MM:SS'
}

export function validarDatosAviso(body: Record<string, unknown>): { datos: DatosAviso | null; errores: string[] } {
  const errores: string[] = [];

  const datos = {
    titulo: textoLimpio(body.titulo),
    mensaje: textoLimpio(body.mensaje),
    tipo: textoLimpio(body.tipo) ?? 'general',
    prioridad: textoLimpio(body.prioridad) ?? 'media',
    audiencia: textoLimpio(body.audiencia) ?? 'todos',
    fechaExpiracion: textoLimpio(body.fechaExpiracion),
  };

  if (!datos.titulo) errores.push('El título es obligatorio');
  revisarLargo(errores, 'El título', datos.titulo, 200);
  if (!datos.mensaje) errores.push('El mensaje es obligatorio');
  revisarLargo(errores, 'El mensaje', datos.mensaje, 2000);

  if (!TIPOS.includes(datos.tipo)) errores.push('El tipo debe ser general, reunion o proyecto');
  if (!PRIORIDADES.includes(datos.prioridad)) errores.push('La prioridad debe ser alta, media o baja');
  if (!AUDIENCIAS.includes(datos.audiencia)) errores.push('La audiencia debe ser todos o directivos');

  if (datos.fechaExpiracion) {
    if (!esFechaHoraValida(datos.fechaExpiracion)) {
      errores.push('La fecha de vencimiento no es válida');
    } else if (new Date(`${datos.fechaExpiracion.slice(0, 16)}:00${ZONA_HORARIA}`) <= new Date()) {
      // La fecha llega en hora de Colombia: se le agrega la zona para compararla con "ahora"
      errores.push('La fecha de vencimiento debe ser futura');
    }
  }

  if (errores.length > 0) {
    return { datos: null, errores };
  }

  const vence = datos.fechaExpiracion ? `${datos.fechaExpiracion.slice(0, 16).replace('T', ' ')}:00` : null;
  return { datos: { ...datos, fechaExpiracion: vence } as DatosAviso, errores };
}
