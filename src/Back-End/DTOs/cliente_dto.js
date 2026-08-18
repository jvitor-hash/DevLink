export class CreateClienteDTO {
  constructor({ name, email, password }) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
}

export class ResponseClienteDTO {
  constructor({ id, name, email }) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
