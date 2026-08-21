import { beforeEach, describe, expect, it, vi } from "vitest";
import { Usuario } from "../Back-End/Models/usuario_model";
import { GetUsuarios, GetUsuarioById } from "../Back-End/Controllers/usuario_controller";

vi.mock("../Back-End/Models/usuario_model", () => ({
  Usuario: {
    GetUsuarios: vi.fn(),
    GetUsuarioById: vi.fn()
  }
}));

describe("Retornar usuário através do id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Teste de mock do metodo de retornar varios usuários.", () => {
    vi.mocked(Usuario.GetUsuarios).mockResolvedValue({});

    const result = Usuario.GetUsuarios();

    expect(result).toEqual(mockData);
    expect(Usuario.GetUsuarios).toHaveBeenCalled(1);
  });

  it("Teste de mock do metodo de retornar um usuário.", () => {
    vi.mocked(Usuario.GetUsuarioById).mockResolvedValue({
      id: 1,
      name: "Carlos Oliverira",
      platforms: ["web", "desktop"],
      email: "carlos.oliveira@example.com",
      description: "",
      userType: "programador",
    });

    const result = Usuario.GetUsuarioById(1);

    if (!result) throw new Error("Erro ao adquirir os dados");

    expect(result).toEqual({
      id: 1,
      name: "Carlos Oliverira",
      platforms: ["web", "desktop"],
      email: "carlos.oliveira@example.com",
      description: "",
      userType: "programador",
    });

    expect(Usuario.GetUsuarioById).toHaveBeenCalledOnce(1);
  });
});
