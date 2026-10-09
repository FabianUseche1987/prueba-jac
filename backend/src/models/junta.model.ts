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

// Datos que llegan del frontend para crear o editar (todo menos el id)
export type DatosJunta = Omit<Junta, 'idJunta'>;

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

// ----- Validación -----

// Quita espacios al inicio y al final. Si queda vacío (o no es texto) devuelve null.
function textoLimpio(valor: unknown): string | null {
  if (typeof valor !== 'string') {
    return null;
  }
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
}

// Agrega un error si el texto supera el largo máximo de su columna en la BD
function revisarLargo(errores: string[], campo: string, valor: string | null, maximo: number) {
  if (valor && valor.length > maximo) {
    errores.push(`${campo} admite máximo ${maximo} caracteres`);
  }
}

// true si el texto es una fecha real con formato AAAA-MM-DD (rechaza, por ejemplo, 2026-02-31)
function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
}

// Revisa los datos que envía el frontend.
// Devuelve los datos limpios (listos para guardar) o la lista de errores.
export function validarDatosJunta(body: Record<string, unknown>): { datos: DatosJunta | null; errores: string[] } {
  const errores: string[] = [];

  const datos = {
    nombre: textoLimpio(body.nombre),
    barrio: textoLimpio(body.barrio),
    municipio: textoLimpio(body.municipio),
    departamento: textoLimpio(body.departamento),
    nit: textoLimpio(body.nit),
    representanteLegal: textoLimpio(body.representanteLegal),
    fechaFundacion: textoLimpio(body.fechaFundacion),
    estado: textoLimpio(body.estado) ?? 'activa',
  };

  // Obligatorios (NOT NULL en la BD)
  if (!datos.nombre) errores.push('El nombre es obligatorio');
  if (!datos.barrio) errores.push('El barrio o vereda es obligatorio');
  if (!datos.municipio) errores.push('El municipio es obligatorio');

  // Largo máximo: el mismo de cada columna en la BD
  revisarLargo(errores, 'El nombre', datos.nombre, 150);
  revisarLargo(errores, 'El barrio', datos.barrio, 100);
  revisarLargo(errores, 'El municipio', datos.municipio, 100);
  revisarLargo(errores, 'El departamento', datos.departamento, 100);
  revisarLargo(errores, 'El NIT', datos.nit, 20);
  revisarLargo(errores, 'El representante legal', datos.representanteLegal, 150);

  if (datos.fechaFundacion && !esFechaValida(datos.fechaFundacion)) {
    errores.push('La fecha de fundación no es válida (formato AAAA-MM-DD)');
  }

  if (datos.estado !== 'activa' && datos.estado !== 'inactiva') {
    errores.push("El estado debe ser 'activa' o 'inactiva'");
  }

  if (errores.length > 0) {
    return { datos: null, errores };
  }
  // Aquí ya sabemos que los obligatorios tienen valor y el estado es válido
  return { datos: datos as DatosJunta, errores };
}
