# Lista de rotas

Prefixo: "localhost:8080" (Exemplo)

* GET "/" -> Página principal

# Rotas de usuarios

* GET "/api/usuario/" -> Todos os clientes.
* GET "/api/usuario/:id" -> Um unico usuário
* GET "/api/usuario/name/?name="" -> Busca por um usuário atraves de seu nome
* POST "/api/usuario/auth" -> Login de usuário.
* POST "/api/usuario/" -> Criação de um cliente
* PATCH "/api/usuario/:id" -> Atualização de informações de um cliente
* DELETE "/api/usuarios/:id" -> Excluir um cliente
