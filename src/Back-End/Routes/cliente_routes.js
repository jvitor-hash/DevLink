import express from 'express';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../Controllers/cliente_controller.js';

const router = express.Router();

router.post("/", createCliente);
router.get("/", getClientes);
router.patch("/:id", updateCliente);
router.delete("/:id", deleteCliente);

export default router;
