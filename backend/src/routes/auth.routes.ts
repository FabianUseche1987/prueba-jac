import { Router } from 'express';
import { iniciarSesion } from '../controllers/auth.controller';

// Rutas que empiezan por /api/auth
const router = Router();

router.post('/login', iniciarSesion);

export default router;
