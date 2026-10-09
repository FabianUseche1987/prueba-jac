import express from 'express';
import cors from 'cors';
import saludRoutes from './routes/salud.routes';
import juntasRoutes from './routes/juntas.routes';
import authRoutes from './routes/auth.routes';
import reunionesRoutes from './routes/reuniones.routes';
import avisosRoutes from './routes/avisos.routes';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores';
import { requiereRol, verificarToken } from './middlewares/autenticacion';

const app = express();

// Solo el frontend (Angular) puede llamar a la API desde el navegador
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Permite leer el cuerpo de las peticiones en formato JSON (req.body)
app.use(express.json());

// Rutas públicas (no necesitan sesión)
app.use('/api/salud', saludRoutes);
app.use('/api/auth', authRoutes);

// Rutas protegidas:
//   verificarToken -> 401 si no hay sesión
//   requiereRol    -> 403 si el perfil no tiene permiso
app.use('/api/juntas', verificarToken, requiereRol('administrador'), juntasRoutes);
app.use('/api/reuniones', verificarToken, requiereRol('directivo', 'ciudadano'), reunionesRoutes);
app.use('/api/avisos', verificarToken, requiereRol('directivo', 'ciudadano'), avisosRoutes);

// Siempre al final: ruta no encontrada y manejo de errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
