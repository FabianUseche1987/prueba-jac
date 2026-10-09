import { Router } from 'express';
import { actualizarJunta, crearJunta, eliminarJunta, listarJuntas } from '../controllers/juntas.controller';

// Rutas que empiezan por /api/juntas
const router = Router();

router.get('/', listarJuntas);          // listar
router.post('/', crearJunta);           // crear
router.put('/:id', actualizarJunta);    // editar
router.delete('/:id', eliminarJunta);   // eliminar

export default router;
