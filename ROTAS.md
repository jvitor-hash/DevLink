# Lista de rotas

Prefixo: "localhost:8080" (Exemplo)

* GET "/" -> Página principal

# Rotas de usuarios

* GET "/api/usuario/" -> Todos os clientes.
* GET "/api/usuario/me" -> Retorna as informacoes do usuario.
* GET "/api/usuario/:id" -> Um unico usuário
* GET "/api/usuario/name/?name=" -> Busca por um usuário(s) através de seu nome
* POST "/api/usuario/auth" -> Login de usuário.
* POST "/api/usuario/auth/refresh" -> Caso o token de acesso tenha expirado ou e invalido havera uma tentativa de adquirir um novo token.
* POST "/api/usuario/" -> Criação de um cliente
* PATCH "/api/usuario/:id" -> Atualização de informações de um cliente
* DELETE "/api/usuarios/:id" -> Excluir um cliente

# Rotas de projetos

* GET "/api/projeto/" -> Todos os projetos.
* GET "/api/projeto/:id" -> Retorna todos as informações de um projeto através de um id.
* GET "/api/projeto/short/:id" -> Retorna as informações resumidas de um projeto através de um id.
* GET "/api/projeto/short/?name=" -> Busca por um 
* POST "/api/projeto/" -> Criação de um projeto
* PATCH "/api/projeto/:id" -> Atualização de um projeto através de um id.
* DELETE "/api/projeto/:id" -> Exclusão de um projeto através de um id.