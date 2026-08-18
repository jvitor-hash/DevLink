export function validateStr(input, options = {}) {
  const {
    minLength = 1,
    maxLength = 255,
    pattern = /^[a-zA-Z0-9_]+$/
  } = options;

  if (typeof input !== "string")
    return false;

  if (input.length < minLength || input.length > maxLength)
    return false;

  if (pattern && !pattern.test(input))
    return false;

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

export function validateSQLInjection(input) {
  if (typeof input !== "string")
    return false;

  const patterns = [
    /(\bUNION\b\s+\bSELECT\b)/i,
    /(\bOR\b|\bAND\b)\s+['"]?\w+['"]?\s*=\s*['"]?\w+/i,
    /(--|#|\/\*)/,
    /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)\s+\b(TABLE|FROM|INTO|SET)\b/i
  ];

  return !patterns.some(pattern => pattern.test(input));
}
