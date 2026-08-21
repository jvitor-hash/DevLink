import express from 'express';
import { CreateUsuario, DeleteUsuario, LoginUsuario, GetUsuarioById, GetUsuarios, UpdateUsuario, GetUsuarioByName } from '../Controllers/usuario_controller.js';

const router = express.Router()

router.post("/", CreateUsuario);
router.post("/auth", LoginUsuario);
router.get("/", GetUsuarios);
router.get("/name", GetUsuarioByName);
router.get("/:id", GetUsuarioById);
router.patch("/:id", UpdateUsuario);
router.delete("/:id", DeleteUsuario);

export default router;
