import express from 'express';
import { CreateUsuario, DeleteUsuario, GetUsuarioById, GetUsuarios, UpdateUsuario } from '../Controllers/usuario_controller.js';

const router = express.Router()

router.post("/", CreateUsuario);
router.get("/", GetUsuarios);
router.get("/:id", GetUsuarioById);
router.patch("/:id", UpdateUsuario);
router.delete("/:id", DeleteUsuario);

export default router;
