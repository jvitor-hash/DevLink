import { beforeEach, describe, expect, it, vi } from "vitest";
import { Projeto } from "../Back-End/Models/projeto_model";

const mock_projeto = {

};

describe("Teste de mock do projetos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Metodo deve retornar todos os dados.", async () => {
    vi.spyOn(Projeto, "findAll").mockResolvedValue(mock_projeto);
  });
});