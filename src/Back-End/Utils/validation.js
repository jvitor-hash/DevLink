export function validateStr(input, options = {}) {
  const {
    minLength = 1,
    maxLength = 255,
    pattern = /^[a-zA-Z0-9_]+$/
  } = options;

  if (typeof input !== "string") {
    return false;
  }

  if (input.length < minLength || input.length > maxLength) {
    return false;
  }

  if (pattern instanceof RegExp) {
    pattern.lastIndex = 0;
    if (!pattern.test(input)) {
      return false;
    }
  }

  return true;
}

export function validateEmail(input) {
  if (typeof input !== "string")
    return false;

  const email = input.trim();

  if(email.length === 0 || email.length > 255)
    return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

/*
  Validacao de inputs como nome, email,
*/
export function validateInputs(inputs) {
  for (const [key, value] of Object.entries(inputs)) {
    switch (key) {
      case 'name':
        if (validateStr(value) === false)
          throw new Error("Nome invalido.");
        break;
      case 'email':
        if (validateEmail(value) === false)
          throw new Error("E-mail invalido.");
        break;
      case 'description':
        if (validateSQLInjection(value) === false)
          throw new Error("Descricao invalida.");
        break;
      case 'password':
        if (validateStr(value) === false)
          throw new Error("Senha invalida.");
        break;
      case 'userType':
        if (validateStr(value) === false)
          throw new Error("Tipo de usuario invalido.");
        break;
      default:
        if (validateStr(value) === false)
          throw new Error(`\'${key}\' e invalido(a)`);
        break;
    }
  }
}
