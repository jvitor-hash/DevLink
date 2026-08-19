export class CreateUsuarioDTO {
  constructor({ name, email, password, description, userType }) {
    this.name = name;
    this.email = email;
    this.description = description;
    this.password = password;
    this.userType = userType;
  }
}

export class ResponseUsuarioDTO {
  constructor({ id, name, email, description, userType }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.description = description;
    this.userType = userType;
  }
}
