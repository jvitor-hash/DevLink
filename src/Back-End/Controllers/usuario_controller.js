import { Usuario } from "../Models/usuario_model.js";
import { CreateUsuarioDTO, ResponseUsuarioDTO } from "../DTOs/usuario_dto.js";
import { CreateRefreshToken, CreateAccessToken, DecodeAccessToken } from "../Utils/tokens.js";
import { validateInputs } from "../Utils/validation.js";
import { Op } from "sequelize";
import "../config.js";
import bcrypt from "bcrypt";
import pino from 'pino';

const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET);
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

if (ACCESS_TOKEN_SECRET === null)
  logger.error("Variável de ambiente [ACCESS_TOKEN_SECRET] esta inválida ou não existe");

if (REFRESH_TOKEN_SECRET === null)
  logger.error("Variável de ambiente [REFRESH_TOKEN_SECRET] esta inválida ou não existe");

if (SALT_ROUNDS === null)
  logger.error("Variável de ambiente [SALT_ROUNDS] esta inválida ou não existe");

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'
  }
});

/*
  None: GetUsuarios
  Autor: Jvitor
  Desc: Retorna todos os usuários disponíveis no banco de dados
  @return: Usuario (Response DTO)
*/
export const GetUsuarios = async (req, res) => {
  try {
    const user = await Usuario.findAll();

    const response = user.map((usuario) => new ResponseUsuarioDTO(usuario));

    return res.status(200).json(response);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao buscar os usuários.",
    });
  }
};

/*
  Nome: GetUsuarioById
  Autor: Jvitor
  Desc: Responsável por buscar um usuário por id (PK)
  e retornar o usuário requesitado
  @param: $1: id(Int)
  @return: Usuario (Response DTO)
*/
export const GetUsuarioById = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await Usuario.findByPk(id);

    if (!user)
      logger.warn("Usuário não existe ou não foi encontrado.");
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "Usuário não existe ou não foi encontrado."
      })

    const dto = new ResponseUsuarioDTO(user);

    return res.status(200).json(dto);
  } catch (error) {
    logger.error(error);
    return res.status(404).json({
      message: "Usuário não encontrado.",
    });
  }
};

/*
  Nome: GetUsuarioByName
  Autor: Jvitor
  Desc: Função responsável por trazer os usuários
  com nomes similares ou iguais ao valor provido
  @param: $1: name(Str)
  @return: users[] (ResponseUsuarioDTO)
*/
export const GetUsuarioByName = async (req, res) => {
  try {
    const name = String(req.query.name || "");

    // Previne um SQL wildcard quando buscando.
    const filteredName = name.replace(/[%_]/g, "\\$&");

    const user = await Usuario.findAll({
      where: {
        name: {
          [Op.iLike]: `%${filteredName}%`
        },
      },
    });

    if (!user || user.length === 0)
      logger.error("Falha ao buscar um usuários");
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: "Falha ao buscar um usuários"
      })

    const response = user.map((u) => new ResponseUsuarioDTO(u));

    return res.status(200).json({
      message: "Usuário encontrado com sucesso.",
      response,
    });
  } catch (error) {
    logger.error(error);
    return res.status(404).json({
      message: "Usuário não encontrado.",
    });
  }
};

/*
  Nome: CreateUsuario
  Autor: Jvitor
  Desc: Função responsável pela criação de usuários,
  validação de inputs é email, geração de hashs de senhas.
  Divisão de passos:
  1º - Validar inputs
  2º - Geração de hash
  3º - Validação de email único
  4º - Criação de DTO com as informações fornecidas
  @param: $1: name(Str), $2: email(Str), $3: password(Str)
  @return: Usuario (Response DTO)
*/
export const CreateUsuario = async (req, res) => {
  try {
    console.log(req.body);

    // Utils(validation.js) -> validateInputs
    validateInputs(req.body);

    // Geração de salt e o hash a partir da provida no req.body
    const { password } = req.body;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { email } = req.body;
    const existingEmail = await Usuario.findOne({ where: { email: email } });

    if (existingEmail)
        return res.status(409).json({
            code: "EMAIL_ALREADY_EXISTING",
            message: "E-mail já sendo utilizado.",
        });

    if (hashedPassword === null || hashedPassword === "")
      logger.warn("Hash de senha inválida.");

    const dto = new CreateUsuarioDTO({
      ...req.body, // E ajustado para (n) argumentos passados
      password: hashedPassword,
    });

    const user = await Usuario.create(dto);

    if (!user)
      logger.error("Error ao criar um novo usuario.");

    const refreshToken = CreateRefreshToken(user)
    const accessToken = CreateAccessToken(user);

    // Salva o token de refresh no cookies de forma segura
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso.",
      accessToken: accessToken
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).json({
      message: "Falha ao criar o usuário.",
    });
  }
};

/*
  Nome: UpdateCliente
  Autor: Jvitor
  Desc: Atualiza um usuário através do id e os dados fornecidos.
  @param: $1: id(Int), $2: name(Str), $3: email(Str), $4: password(Str)
  @return: Cliente (Response DTO)
*/

// FIXME: Resolver query de resultados para nao retornar todos
export const UpdateUsuario = async (req, res) => {
  try {
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const id = req.params.id;
    const user = await Usuario.findByPk(id);

    if (!user)
      logger.error("Usuário não encontrado.");

    validateInputs(req.body);

    // Geração de novo hash de senha caso a senha esteja sendo modificada.
    const { password } = req.body;
    if (password !== null && saltRounds !== null) {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (hashedPassword !== null) {
        await Usuario.update(
          { ...req.body, password: hashedPassword },
          { where: { id: id } },
        );

        return res.status(200).json({
          message: "Usuário atualizado com sucesso."
        });
      } else {
        logger.error("Falha ao gerar hash de nova senha.");
      }
    }

    await Usuario.update({ ...req.body }, { where: { id: id } });

    return res.status(200).json({
      message: "Usuário atualizado com sucesso.",
    });
  } catch (error) {
    logger.error(error);
    return res.status(404).json({
      message: "Usuário não encontrado.",
    });
  }
};

/*
  Nome: DeleteCliente
  Autor: Jvitor
  Desc: Responsável por deletar um cliente através de um id
  @params: $1: id(Int)
*/
export const DeleteUsuario = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await Usuario.destroy({
      where: {
        id: Number(id),
      },
    });

    if (!user)
      logger.warn("Cliente não encontrado.");
      res.status(404).json({
          code: "USER_NOT_FOUND",
          message: "Cliente não encontrado."
      })

    return res.status(200).json({
      message: "Usuário excluido com sucesso.",
    });
  } catch (error) {
    logger.error(error);
    return res.status(404).json({
      message: "Usuário não encontrado.",
    });
  }
};

/*
  Nome: LoginUsuario
  Autor: Jvitor
  Desc: Responsável por validar entradas, validar credencials e
  retornar um token de acesso e um refresh token.
  @params: $1: email(Str), $2: password(Str)
  @return: Access Token (JWT Token), Refresh Token (JWT Token)
*/
export const LoginUsuario = async (req, res) => {
  try {
    validateInputs(req.body);

    const { email } = req.body;
    const user = await Usuario.findOne({ where: { email: email } });

    if (user === null)
      return res.status(404).json({
        message: "Usuário não encontrado.",
      });

    const { password } = req.body;

    if (password === null)
      logger.warn("Senha não fornecida.");

    const passwordValid = await bcrypt.compare(password, user.password);

    if (passwordValid) {
      const accessToken = CreateAccessToken(user);
      const refreshToken = CreateRefreshToken(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      });

      return res.status(200).json({
        message: "Login com success",
        accessToken
      });

    } else {
      return res.status(403).json({
        message: "Senha incorreta",
      });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha na tentativa de login.",
    });
  }
};

/*
  Nome: GetCurrentUsuario
  Autor: Jvitor
  Desc: Um função bounce back quando o usuário se cadastra com sucesso.
  Está função retorna os dados do usuário a partir do id.
  @return: User (ResponseUsuarioDTO)
*/
export const GetCurrentUsuario = async (req, res) => {
  try {
    // Surely this won't come to be bite me in the ass later
    const user = await Usuario.findByPk(req.user?.id);

    if (!user)
      logger.warn("Falha nao foi possivel encontrar um usuario.");
      res.status(404).json({
          code: "USER_NOT_FOUND",
          message: "Falha nao foi possivel encontrar um usuario."
      });
      

    const response = new ResponseUsuarioDTO(user);

    return res.status(200).json(response);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao trazer os dados relevante ao usuário.",
    });
  }
};

/*
  Nome: RefreshToken
  Autor: Jvitor
  Desc: Responsável por receber as requesicoes feitas pelo usuario a cada 10 minutos e validar a autenticidade
  @params: $1: AccessToken(JWT Token), $2: RefreshToken(JWT Token)
*/
export const RefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Token não existente",
      });
    }

    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    if (!payload?.sub) {
      return res.status(401).json({
        message: "Token inválido ou expirado.",
      });
    }

    const accessToken = jwt.sign({
        sub: payload.sub,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      });

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    logger.error(error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Refresh token expirado.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Refresh token inválido.",
      });
    }

    return res.status(500).json({
      message: "Falha ao renovar o token.",
    });
  }
};

export const SignOut = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });

    return res.status(200).json({
      message: "Log-out com sucesso"
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao fazer log-out"
    });
  };
}
