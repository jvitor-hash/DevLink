import config_role from '../../Config/roles.json';

export class Role {
    constructor() {
        this.roles = config_role.roles;
    }

    getRoleByName(name) {
        return this.roles.find((role) => role.name === name);
    }

    getRoles() {
        return this.roles;
    }
}