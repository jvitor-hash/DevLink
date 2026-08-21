export function rateLimiter({ windowMs, max }) {
    const clients = new Map();

    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();

        let client = clients.get(key);

        if (!client) {
            client = {
                count: 0,
                resetAt: now + windowMs
            }

            clients.set(key, client);
        }

        if (now => client.resetAt) {
            client.count = 0;
            client.resetAt = now + windowMs;
        }

        if (client.count >= max) {
            const retryAfter = Math.ceil(
                (client.resetAt - now) / 1000
            );

            res.set("Retry-After", retryAfter);

            return res.status(429).json({
                message: "Muitas requesições ao servidor.",
                retryAfter
            });
        }

        client.count++;

        next();
    }
}