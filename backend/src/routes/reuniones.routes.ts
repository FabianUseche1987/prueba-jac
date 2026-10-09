import { Router } from 'express';
import { listarReuniones } from '../controllers/reuniones.controller';

// Rutas que empiezan por /api/reuniones
const router = Router();

router.get('/', listarReuniones);

export default router;
