import { Usuario } from '../Models/usuario_model.js';
import { CreateUsuarioDTO, ResponseUsuarioDTO } from '../DTOs/usuario_dto.js';
import { validateInputs } from '../Utils/validation.js';
import '../config.js';
import bcrypt from 'bcrypt';

/*
  None: GetUsuarios
  Autor: Jvitor
  Desc: Retorna todos os usuários disponíveis no banco de dados
  @return: Usuario (Response DTO)
*/
export const GetUsuarios = async (req, res) => {
  try {
    const user = await Usuario.findAll();

    const response = user.map(usuario => new ResponseUsuarioDTO(usuario));

    return res.status(200).json(response);
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(500).json({
      message: "Falha ao buscar os usuários."
    });
  }
}

/*
  Nome: GetUsuarioById
  Autor: Jvitor
  Desc: Responsável por buscar um usuário por id (PK)
  e retornar o usuário requesitado
  @params: id (number)
  @return: Usuario (Response DTO)
*/
export const GetUsuarioById = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await Usuario.findByPk(id);

    if (!user)
      throw new Error("Usuário não existe ou não foi encontrado.");

    const dto = new ResponseUsuarioDTO(user);

    return res.status(500).json(dto);
  } catch (error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(404).json({
      message: "Usuário não encontrado."
    });
  }
}

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
  @params: name (str), email (str), password (str)
  @return: Usuario (Response DTO)
*/
export const CreateUsuario = async (req, res) => {
  try {
    const saltRounds = Number(process.env.SALT_ROUNDS);

    if (saltRounds === null)
      throw new Error("Variavel de ambiente [SALT_ROUNDS] esta inválida ou não existe");

    // Utils(validation.js) -> validateInputs
    validateInputs(req.body);

    // Geração de salt e o hash a partir da provida no req.body
    const { password } = req.body;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { email } = req.body;
    const existingEmail = await Usuario.findOne({ where: { email: email } });

    if (existingEmail)
      throw new Error("E-mail sendo usado.");

    if (hashedPassword === null || hashedPassword === "")
      throw new Error("Hash de senha inválida.");


    const dto = new CreateUsuarioDTO({
      ...req.body, // E ajustado para (n) argumentos passados
      password: hashedPassword
    });

    const user = await Usuario.create(dto);

    const response = new ResponseUsuarioDTO(user);

    return res.status(201).json(response);
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(400).json({
      message: "Falha ao criar o usuário."
    });
  }
}

/*
  Nome: UpdateCliente
  Autor: Jvitor
  Desc: Atualiza um usuário através do id e os dados fornecidos.
  @params: id (str), name (str), email (str), password (str)
  @return: Cliente (Response DTO)
*/
export const UpdateUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await Usuario.findByPk(id);

    if (!user)
      throw new Error("Usuário não encontrado.");

    validateInputs(req.body);

    await Usuario.update({ ...req.body });

    const response = new ResponseUsuarioDTO(user);

    return res.status(200).json({
      message: "Usuário atualizado com sucesso.",
      response
    });
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(404).json({
      message: "Usuário não encontrado."
    });
  }
}

/*
  Nome: DeleteCliente
  Autor: Jvitor
  Desc: Responsável por deletar um cliente através de um id
  @params: id (int)
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
      throw new Error("Cliente não encontrado.");

    return res.status(204).json({
      message: "Usuário excluido com sucesso."
    });
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(404).json({
      message: "Usuário não encontrado."
    });
  }
}
