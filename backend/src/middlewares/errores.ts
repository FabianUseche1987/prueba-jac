import { NextFunction, Request, Response } from 'express';

// Se ejecuta cuando ninguna ruta coincide -> 404
export function rutaNoEncontrada(req: Request, res: Response) {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

// Se ejecuta cuando algo falla en cualquier ruta.
// Responde un JSON en lugar de dejar que la API se caiga.
// Express lo reconoce como manejador de errores porque recibe 4 parámetros.
export function manejarErrores(error: unknown, req: Request, res: Response, _next: NextFunction) {
  // El cuerpo de la petición no es un JSON válido
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }

  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}
