// Funciones de validación que usan varios modelos (juntas, reuniones...).

// Quita espacios al inicio y al final. Si queda vacío (o no es texto) devuelve null.
export function textoLimpio(valor: unknown): string | null {
  if (typeof valor !== 'string') {
    return null;
  }
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
}

// Agrega un error si el texto supera el largo máximo de su columna en la BD
export function revisarLargo(errores: string[], campo: string, valor: string | null, maximo: number) {
  if (valor && valor.length > maximo) {
    errores.push(`${campo} admite máximo ${maximo} caracteres`);
  }
}

// true si el texto es una fecha real con formato AAAA-MM-DD (rechaza, por ejemplo, 2026-02-31)
export function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
}

// true si el texto es una fecha y hora real con formato AAAA-MM-DDTHH:MM (los segundos son opcionales)
export function esFechaHoraValida(texto: string): boolean {
  const partes = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(:\d{2})?$/.exec(texto);
  if (!partes) {
    return false;
  }
  const [, fecha, horas, minutos] = partes;
  return esFechaValida(fecha) && Number(horas) < 24 && Number(minutos) < 60;
}
