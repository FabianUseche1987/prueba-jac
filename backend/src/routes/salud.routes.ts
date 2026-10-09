import { Router } from 'express';
import { obtenerSalud } from '../controllers/salud.controller';

// Rutas que empiezan por /api/salud
const router = Router();

router.get('/', obtenerSalud);

export default router;
