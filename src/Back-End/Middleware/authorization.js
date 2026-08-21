import { Role } from '../Models/role.js';
import { Permission } from '../Models/permissions.js';

export const CheckPermission = (permission) => {
    return (req, res, next) => {
        const userType = req.user ? req.user.role : 'anonymous';
        const userPermission = new Permission().getPermissionByRoleName(userType);

        if (userPermission.includes(permission)) {
            return next();
        } else {
            return res.status(403).json({
                message: "Usuário não possui permissão."
            });
        }
    }
}