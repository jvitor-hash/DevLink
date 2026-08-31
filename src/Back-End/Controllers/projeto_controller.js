import { Projeto } from '../Models/projeto_model.js';
import { CreateProjetoDTO, ResponseProjetoDTO, ResponseShortProjetoDTO } from '../DTOs/projetos_dto.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'
  }
});

/*
  Nome: GetProjetos
  Autor: Jvitor
  Desc: ...
  @return: Projetos(Response)
*/
export const GetProjetos = async (req, res) => {
  try {
    const projetos = await Projeto.findAll();

    if (!projetos)
      logger.error("Error ao tentar retornar todos os projetos");
      res.status(404).json({
          code: "PROJECT_NOT_FOUND",
          message: "Error ao tentar retornar todos os projetos"
      });

    const response = projetos.map((projeto) => new ResponseProjetoDTO(projeto));

    return res.status(200).json({response});
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao retornar os projetos"
    });
  }
}

/*
  Nome: GetProjetoById
  Autor: Jvitor
  Desc: ...
*/
export const GetProjetoById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id)
            return res.status(500).json({
                message: "Faltando id necessario para busca"
            });
        
        const projects = await Project.findByPk(id);

        
        
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao retornar projeto"
    });
  }
}

/*
  Nome: GetProjetoShortById
  Autor: Jvitor
  Desc: ...
*/
export const GetProjetoShortById = async (req, res) => {
  try {
      
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao retornar as informações do projeto"
    });
  }
}

/*
  Nome: GetProjetoByName
  Autor: Jvitor
  Desc: ...
  @params: $1: Name(Str)
*/
export const GetProjetoShortByName = async (req, res) => {
  try {

  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao retornar um projeto"
    });
  }
}

/*
  Nome: UpdateProjeto
  Autor: Jvitor
  Desc: Responsável por atualizar um projeto através de um id.
  @params: $1: Id(Int)
*/
export const UpdateProjeto = async (req, res) => {
  try {

  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao atualizar o projeto"
    });
  }
}

/*
  Nome: DeleteProjeto
  Autor: Jvitor
  Desc: Responsável por excluir um projeto através do id
  @params: $1: Id(Int)
*/
export const DeleteProjeto = async (req, res) => {
  try {

  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "Falha ao deletar um projeto"
    });
  }
}
