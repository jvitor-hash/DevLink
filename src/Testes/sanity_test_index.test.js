import { describe, expect, it } from 'vitest'
import dotenv from 'dotenv';

dotenv.config({path: "./env.env"});

describe('Página principal sanity test', () => {
    it('returns HTTP 200', async () => {
        const response = await fetch(`http://localhost:${process.env.PORT}/`);

        expect(response.status).toBe(200);
    });
});