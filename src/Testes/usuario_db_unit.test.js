import { beforeEach, describe, expect, it, vi } from "vitest";
import { Usuario } from "../Back-End/Models/usuario_model";
import { GetUsuarios, GetUsuarioById } from "../Back-End/Controllers/usuario_controller";

vi.mock("../Back-End/Models/usuario_model", () => ({
  Usuario: {
    GetUsuarios: vi.fn(),
    GetUsuarioById: vi.fn(),
    GetUsuarioByName: vi.fn()
  }
}));

describe("Retornar usuário através do id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Teste de mock do metodo de retornar varios usuários.", async () => {

  });

  it("Teste de mock do metodo de retornar um usuário.", async () => {

  });

  it("Teste de mock do metodo de retornar um usuários através de um nome", async () => {

  })
});
