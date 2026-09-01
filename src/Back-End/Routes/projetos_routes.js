import express from 'express';
import { GetProjetos, GetProjetoById, GetProjetosShort, GetProjetoShortByName } from '../Controllers/projeto_controller.js';
import { authenticateToken } from '../Middleware/authenticator.js';

const router = express.Router();

// router.post("/", CreateProjeto);
router.get("/", GetProjetos);
router.get("/short/", GetProjetosShort);
router.get("/title/", GetProjetoShortByName);
router.get("/:id", GetProjetoById);
// router.patch("/:id", UpdateProjeto);
// router.delete("/:id", DeleteProjeto);

export default router;
