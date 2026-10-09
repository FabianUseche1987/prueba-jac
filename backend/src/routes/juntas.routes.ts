import { Router } from 'express';
import { listarJuntas } from '../controllers/juntas.controller';

// Rutas que empiezan por /api/juntas
const router = Router();

router.get('/', listarJuntas);

export default router;
