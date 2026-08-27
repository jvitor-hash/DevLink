import express from 'express';
import { GetProjetos } from '../Controllers/projeto_controller.js';
import { authenticateToken } from '../Middleware/authenticator.js';

const router = express.Router();

// router.post("/", CreateProjeto);
router.get("/", GetProjetos);
// router.get("/:id", GetProjetoById);
// router.get("/name", GetProjetoByName);
// router.patch("/:id", UpdateProjeto);
// router.delete("/:id", DeleteProjeto);

export default router;