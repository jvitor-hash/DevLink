import { describe, it, expect } from "vitest";
import { CreateRefreshToken, VerifyRefreshAndRegenerate } from "../../Back-End/Utils/tokens";

describe("Validar um token de refresh e retornar um novo token de acesso", () => {
    it("Função deve retornar o novo token de acesso e um token novo de refresh", () => {
        const user = {
            id: 1,
            email: 'hello-world@example.com'
        };

        const refreshTokenInit = CreateRefreshToken(user);
        
        const { refreshTokenNovo, accessTokenNovo } = VerifyRefreshAndRegenerate(refreshTokenInit, user);

        expect(refreshTokenNovo).not.toBe(null);
        expect(accessTokenNovo).not.toBe(null);
        expect(refreshTokenInit).not.toBe(refreshTokenNovo);
    });
})