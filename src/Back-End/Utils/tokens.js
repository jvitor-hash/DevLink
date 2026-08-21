import jwt from "jsonwebtoken";

/*
  Nome: CreateAccessToken
  Autor: Jvitor
  Desc: Responsavel por criar um token de
  acesso para os usuarios com uma duracao de 15 minutos
  @param: $1: id(Int), $2: email(Str)
  @return: Token (JWT Token)
*/
export function CreateAccessToken(data) {
  const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET);
  const userId = Number(data.id);
  const userEmail = String(data.email);

  if (!userId || !userEmail)
    throw new Error("Erro ao tentar criar um token a partir do email e id.");

  return jwt.sign(
    {
      sub: userId,
      email: userEmail,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
      issuer: "devlink-api",
      audience: "client",
    },
  );
}

/*
  Nome: CreateRefreshToken
  Autor: Jvitor
  Desc: Responsavel por criar um token que ao ser utilizado cria o
  token de acesso para o usuario, com um tempo de duracao de um 1 dia.
  @param: $1: id(Int)
  @return: Token (JWT Token)
*/
export function CreateRefreshToken(data) {
  const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET);
  const userId = Number(data.id);

  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
      issuer: "devlink-api",
      audience: "client",
    },
  );
}

export function DecodeAccessToken(token) {
  try {
    const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET);

    if (!ACCESS_TOKEN_SECRET)
      throw new Error("Falha nas variáveis de ambiente: ACCESS_TOKEN_SECRET");

    const verifyResult = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (!verifyResult) throw new Error("Error ao verificar token");

    const data = jwt.decode(token, ACCESS_TOKEN_SECRET);

    if (!data) throw new Error("Dados inválidos do token provido.");

    return data;
  } catch (error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}`);
  }
}

export function DecodeRefreshToken(token) {
  try {
    const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET);

    if (!REFRESH_TOKEN_SECRET)
      throw new Error("Falha nas variáveis de ambiente: REFRESH_TOKEN_SECRET");

    const verifyResult = jwt.verify(token, REFRESH_TOKEN_SECRET);

    if (!verifyResult) throw new Error("Error ao verificar token");

    const data = jwt.decode(token, REFRESH_TOKEN_SECRET);

    if (!data) throw new Error("Dados inválidos do token provido.");

    return data;
  } catch (error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}`);
  }
}
