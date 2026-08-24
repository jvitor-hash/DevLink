import { describe, expect, it } from "vitest";
import { CreateAccessToken, CreateRefreshToken, DecodeAccessToken, DecodeRefreshToken } from "../../Back-End/Utils/tokens";

describe("Teste de criacao de tokens decodificacao de tokens.", () => {
  it("Teste de codificar de um token e recolher as mesma informacoes providas", () => {
    const user = {
        id: 1,
        email: 'hello-world@gmail.com'
    };

    const token = CreateAccessToken(user);
    const decodedToken = DecodeAccessToken(token);

    expect(decodedToken).toMatchObject({
      sub: 1,
      email: 'hello-world@gmail.com'
    });
  });

  it("Teste de condificar o token de refresh e recolher as mesmas informacoes providas", () => {
    const user = {
      id: 1
    }

    const token = CreateRefreshToken(user);
    const decodedToken = DecodeRefreshToken(token);

    expect(decodedToken).toMatchObject({
      sub: 1
    });
  });
});
