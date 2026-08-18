import { Cliente } from '../Models/cliente_model.js';
import { CreateClienteDTO, ResponseClienteDTO } from '../DTOs/cliente_dto.js';
import { validateStr, validateSQLInjection, validateEmail } from '../Utils/validation.js';

export const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();

    const response = clientes.map(cliente => new ResponseClienteDTO(cliente));
    
    return res.status(200).json(response);
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(500).json({
      message: "Falha ao buscar os usuários."
    });
  }
}

export const createCliente = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if(validateStr(email) && validateSQLInjection(email) && validateEmail(email))
      throw new Error("E-mail invalido.");

    if(validateStr(name) && validateSQLInjection(name))
      throw new Error("Nome invalido.");

    if(validateStr(password) && validateSQLInjection(password))
      throw new Error("Senha invalida.");

    const existingEmail = await Cliente.findOne({ where: { email: email } });
    
    if (existingEmail)
      throw new Error("E-mail sendo usado.");

    const dto = new CreateClienteDTO(req.body);

    const cliente = await Cliente.create(dto);

    const response = new ResponseClienteDTO(cliente);

    return res.status(201).json(response);
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(400).json({
      message: "Falha ao criar o usuário."
    });
  }
}

export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params.id;
    const { name, email, password } = req.body;

    const cliente = await Cliente.findByPk(id);

    if (!cliente)
      throw new Error("Usuário nao encontrado.");
    
    if (!validateStr(name) && !validateSQLInjection(name))
      throw new Error("Nome inválido.");

    if (!validateStr(email) && !validateSQLInjection(email) && !validateEmail(email))
      throw new Error("Email inválido.");

    if(!validateStr(password) && !validateSQLInjection(password))
      throw new Error("Senha inválida.");

    await cliente.update({
      name,
      email,
      password
    });

    const response = new ResponseClienteDTO(cliente);

    return res.status(200).json({
      message: "Usuário atualizado com sucesso.",
      response
    });
  } catch(error) {
    console.error(`\x1b[41m\x1b[1;32m BACK-END \x1b[0m\x1b[0m ${error}.`);
    return res.status(404).json({
      message: "Usuário nao encontrado."
    });
  }
}

export const deleteCliente = async (req, res) => {

}
