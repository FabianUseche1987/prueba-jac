import { Router } from 'express';
import { actualizarReunion, crearReunion, listarReuniones } from '../controllers/reuniones.controller';
import { guardarAsistencia, obtenerAsistencia } from '../controllers/asistencia.controller';
import { requiereRol } from '../middlewares/autenticacion';

// Rutas que empiezan por /api/reuniones
// (en app.ts ya se exige sesión y perfil directivo o ciudadano)
const router = Router();

router.get('/', listarReuniones);                                  // ver: directivos y ciudadanos
router.post('/', requiereRol('directivo'), crearReunion);          // convocar: solo directivos
router.put('/:id', requiereRol('directivo'), actualizarReunion);   // editar: solo directivos

// Asistencia: solo directivos (la lista tiene nombres y justificaciones)
router.get('/:id/asistencia', requiereRol('directivo'), obtenerAsistencia);
router.put('/:id/asistencia', requiereRol('directivo'), guardarAsistencia);

export default router;
