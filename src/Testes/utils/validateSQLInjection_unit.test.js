import { describe, it, expect } from 'vitest';
import { validateSQLInjection } from '../../Back-End/Utils/validation';

describe('', () => {
    it('Validar string (UNION SELECT) e retornar false', () => {
        const invalidStr = "UNION SELECT username, password";

        const result = validateSQLInjection(invalidStr);

        expect(result).toBe(false);
    });

    it('Validar string (OR/AND) e retornar false', () => {
        const invalidStr = "OR \'1\'=\'1\'";

        const result = validateSQLInjection(invalidStr);

        expect(result).toBe(false);
    });

    it('Validar string (marcadores de comentário SQL) e retornar false', () => {
        const invalidStr = "admin' #";

        const result = validateSQLInjection(invalidStr);

        expect(result).toBe(false);
    });

    it('Validar string (Instruções SQL destrutivas ou de modificação) e retornar false', () => {
        const invalidStr = "delete from users";

        const result = validateSQLInjection(invalidStr);

        expect(result).toBe(false);
    });

    it('Validar string (commum) e retornar true', () => {
        const validStr = "Hello, World!";

        const result = validateSQLInjection(validStr);

        expect(result).toBe(true);
    })
})
