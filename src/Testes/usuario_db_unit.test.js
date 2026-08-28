import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetUsuarios, GetUsuarioById, GetUsuarioByName, UpdateUsuario, DeleteUsuario } from "../Back-End/Controllers/usuario_controller";
import { Usuario } from "../Back-End/Models/usuario_model";

// Dados para simular o banco de dados
const mock_usuarios = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@example.com',
    platforms: [],
    userType: 'cliente',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    platforms: [],
    userType: 'cliente',
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@example.com',
    platforms: ['web', 'desktop'],
    userType: 'programador',
  },
  {
    id: 4,
    name: 'Ana Costa',
    email: 'ana.costa@example.com',
    platforms: ['desktop', 'mobile'],
    userType: 'programador',
  }
];

describe("Teste de mock do usuários", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TESTE - 1
  it("Metodo deve retornar varios usuários.", async () => {
    // Intercepta a função findAll para retorna os dados mockados
    vi.spyOn(Usuario, "findAll").mockResolvedValue(mock_usuarios);

    const req = {};

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    await GetUsuarios(req, res);

    expect(Usuario.findAll).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  // TESTE - 2
  it("Metodo deve retornar um usuário.", async () => {
    vi.spyOn(Usuario, "findByPk").mockResolvedValue(mock_usuarios);

    const req = {
      params: {
        id: 1
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    await GetUsuarioById(req, res);

    expect(Usuario.findByPk).toHaveBeenCalledOnce();
    expect(Usuario.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  // TESTE - 3
  it("Metodo deve retornar um usuário(s) através de um nome", async () => {
    vi.spyOn(Usuario, "findAll").mockResolvedValue([mock_usuarios[3]]);

    const req = {
      query: {
        name: "Ana"
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await GetUsuarioByName(req, res);

    expect(Usuario.findAll).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled([mock_usuarios[3]]);
  });

  // TESTE - 4
  it("Metodo deve atualizar com sucesso um usuário.", async () => {
    vi.spyOn(Usuario, "findByPk").mockResolvedValue(mock_usuarios[0]);
    // Sequelize normalmente retorna um array com o numero de columnas afetadas apos um update
    vi.spyOn(Usuario, "update").mockResolvedValue([1]);

    const req = {
      params: {
        id: 1
      },

      body: {
        name: "Teste123",
        email: "Teste@exemplo.com",
        password: "987654321"
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    await UpdateUsuario(req, res);

    expect(Usuario.findByPk).toHaveBeenCalledOnce();
    expect(Usuario.findByPk).toHaveBeenCalledWith(1);

    expect(Usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Teste123",
        email: "Teste@exemplo.com"
      }),
      {
        where: {
          id: 1
        }
      }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuário atualizado com sucesso."
    });
  });

  // Teste - 4 (Feito para falhar ao rodar)
  it("Metodo feito para falhar", async () => {
    vi.spyOn(Usuario, "findByPk").mockResolvedValue(mock_usuarios[0]);
    vi.spyOn(Usuario, "update").mockResolvedValue([1]);
    const req = {
      params: {
        id: 1
      },
      body: {
        name: "Teste123",
        email: "Teste@exemplo.com",
        password: "987654321"
      }
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    await UpdateUsuario(req, res);
    expect(Usuario.findByPk).toHaveBeenCalledOnce();
    expect(Usuario.findByPk).toHaveBeenCalledWith(1);
    expect(Usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Teste123",
        email: "Teste@exemplo.com"
      }),
      {
        where: {
          id: 3
        }
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuário atualizado com sucesso."
    });
  });

  // Teste - 5
  it("Metodo deve excluir um usuário", async () => {
    vi.spyOn(Usuario, "destroy").mockResolvedValue([1]);

    const req = {
      params: {
        id: 1
      }
    }

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }

    await DeleteUsuario(req, res);

    expect(Usuario.destroy).toHaveBeenCalledOnce();
    expect(Usuario.destroy).toHaveBeenCalledWith({
      where: {
        id: 1
      }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuário excluido com sucesso."
    });
  });
});
