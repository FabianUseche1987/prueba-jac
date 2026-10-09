import { Router } from 'express';
import {
  contarNoLeidos,
  crearAviso,
  eliminarAviso,
  listarAvisos,
  marcarLeido,
  marcarTodosLeidos,
} from '../controllers/avisos.controller';
import { requiereRol } from '../middlewares/autenticacion';

// Rutas que empiezan por /api/avisos
// (en app.ts ya se exige sesión y perfil directivo o ciudadano)
const router = Router();

router.get('/', listarAvisos);                      // ver
router.get('/no-leidos', contarNoLeidos);           // número para la campana
router.put('/leidos', marcarTodosLeidos);           // marcar todos como leídos
router.put('/:id/leido', marcarLeido);              // marcar uno como leído
router.post('/', requiereRol('directivo'), crearAviso);            // publicar: solo directivos
router.delete('/:id', requiereRol('directivo'), eliminarAviso);    // eliminar: solo directivos

export default router;
