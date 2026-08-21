import { describe, it, expect } from 'vitest';
import { validateStr } from '../../Back-End/Utils/validation';

describe('Validação de uma string.', () => {
  /*
    Tipos de string inválidas:
      - hello-world   # hífen
      - hello world   # spaço
      - hello.world   # .
      - hello@world   # @
      - hello!        # !
      - hello/world   # /
      - hello+world
  */
  it('Validar string e retornar false', () => {
    const invalidStr = "Hello, World!";

    const result = validateStr(invalidStr);

    expect(result).toBe(false);
  })

  /*
    Tipos de string validas:
      - hello
      - Hello
      - HELLO
      - hello123
      - 12345
      - user_name
      - User_Name123
      - _test_
      - a1_b2_c3
  */
  it('Validar string e retornar true', () => {
    const validStr = "Hello_World";

    const result = validateStr(validStr);

    expect(result).toBe(true);
  })
});
