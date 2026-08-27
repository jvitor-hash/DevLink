import express from 'express';
import { authenticateToken } from '../Middleware/authenticator.js';
import {
  CreateUsuario, DeleteUsuario, LoginUsuario,
  GetUsuarioById, GetUsuarios, UpdateUsuario,
  GetUsuarioByName, RefreshToken, GetCurrentUsuario
} from '../Controllers/usuario_controller.js';

const router = express.Router();

router.post("/", CreateUsuario);
router.post("/auth", LoginUsuario);
router.post("/auth/refresh", RefreshToken);
router.get("/", authenticateToken, GetUsuarios);
router.get("/me", authenticateToken, GetCurrentUsuario);
router.get("/name", authenticateToken, GetUsuarioByName);
router.get("/:id", authenticateToken, GetUsuarioById);
router.patch("/:id", authenticateToken, UpdateUsuario);
router.delete("/:id", authenticateToken, DeleteUsuario);

export default router;
