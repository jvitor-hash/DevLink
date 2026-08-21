import { describe, it, expect } from "vitest";
import { validateEmail } from "../../Back-End/Utils/validation";

describe('Testar a validação de emails', () => {
    /*
        Tipos de emails inválidos:
           - alice@example
           - @example.com
           - alex@
           - lucas@example.
           - john example@test.com
           - alice@@example.com
    */
    it('Validar string contendo email inválido e retornar false', () => {
        const invalidStr = "@exemplo.com";

        // Função espera uma string como entrada.
        const result = validateEmail(invalidStr);

        expect(result).toBe(false);
    });

    /*
        Tipos de emails válidos:
            - alice@example.com
            - john.doe@example.co.uk
            - user123@test.io
            - hello+tag@gmail.com
            - a@b.co
            - first.last@company.org
            - user_name@domain.com
            - user-name@domain.net
    */
    it('Validar string contendo email valido e retornar true', () => {
        const validStr = "teste@gmail.com";

        const result = validateEmail(validStr);

        expect(result).toBe(true);
    });
})
