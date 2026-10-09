import { Router } from 'express';
import { iniciarSesion, listarJuntasParaRegistro, registrarUsuario } from '../controllers/auth.controller';

// Rutas que empiezan por /api/auth (todas públicas: se usan antes de tener sesión)
const router = Router();

router.post('/login', iniciarSesion);
router.get('/juntas', listarJuntasParaRegistro);
router.post('/registro', registrarUsuario);

export default router;
