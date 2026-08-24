import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET);

export function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth?.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = auth.substring(7);

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    return res.sendStatus(401);
  }
}
