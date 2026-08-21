export class CreateUsuarioDTO {
  constructor({ name, email, password, platforms, description, userType }) {
    this.name = name;
    this.email = email;
    this.platforms = platforms;
    this.description = description;
    this.password = password;
    this.userType = userType;
  }
}

export class ResponseUsuarioDTO {
  constructor({ id, name, email, platforms, description, userType }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.platforms = platforms;
    this.description = description;
    this.userType = userType;
  }
}
