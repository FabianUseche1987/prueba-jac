// Aviso de la junta, tal como lo envía la API (tablas `notificacion` y `notificacion_usuario`)
export interface Aviso {
  idAviso: number;
  titulo: string;
  mensaje: string;
  tipo: string;                    // general | reunion | proyecto
  prioridad: string;               // alta | media | baja
  audiencia: string;               // todos | directivos
  fechaEnvio: string;              // 'AAAA-MM-DDTHH:MM:SS'
  fechaExpiracion: string | null;  // después de esta fecha ya no se muestra
  remitente: string;
  leido: boolean;                  // si el usuario actual ya lo leyó
}

// Datos que envía el formulario para publicar un aviso
export interface DatosAviso {
  titulo: string;
  mensaje: string;
  tipo: string;
  prioridad: string;
  audiencia: string;
  fechaExpiracion: string | null;  // 'AAAA-MM-DDTHH:MM'
}
