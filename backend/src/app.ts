import express from 'express';
import cors from 'cors';
import saludRoutes from './routes/salud.routes';
import juntasRoutes from './routes/juntas.routes';
import authRoutes from './routes/auth.routes';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores';
import { verificarToken } from './middlewares/autenticacion';

const app = express();

// Solo el frontend (Angular) puede llamar a la API desde el navegador
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Permite leer el cuerpo de las peticiones en formato JSON (req.body)
app.use(express.json());

// Rutas públicas (no necesitan sesión)
app.use('/api/salud', saludRoutes);
app.use('/api/auth', authRoutes);

// Rutas protegidas: verificarToken se ejecuta antes y rechaza (401) si no hay sesión
app.use('/api/juntas', verificarToken, juntasRoutes);

// Siempre al final: ruta no encontrada y manejo de errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
