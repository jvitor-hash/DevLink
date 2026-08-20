import jwt from 'jsonwebtoken';

export function CreateAccessToken(user) {
    const access_secret = String(process.env.JWT_ACCESS_SECRET);

    return jwt.sign(
        {
            sub: user.id,
            email: user.email
        },
        access_secret,
        {
            expiresIn: '15m',
            issuer: 'devlink-api',
            audience: 'client'
        }
    );
}

export function CreateRefreshToken(user) {
    const refresh_secret = String(process.env.JWT_REFRESH_SECRET);

    return jwt.sign(
        {
            sub: user.id,
            type: "refresh"
        },
        refresh_secret,
        {
            expiresIn: '1d',
            issuer: 'devlink-api',
            audience: 'client'
        }
    );
}