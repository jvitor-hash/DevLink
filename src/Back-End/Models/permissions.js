import config_role from '../../Config/roles.json';

export class Permission {
    constructor () {
        this.roles = config_role.roles;
    }

    getPermissionByRoleName(roleName) {
        const role = this.roles.find((role) => role.name === roleName);
        return role ? role.permissions : [];
    }
}