import Session from "../models/Session.js";

export const SESSION_COOKIE = "movie_session";

export default async function checkAuth(req, res, next) {
  const session = await Session.validateSession(req.cookies?.[SESSION_COOKIE]);
  if (!session) return res.status(401).json({ error: "invalid session" });
  req.user = session.user;
  req.sessionId = session.sessionId;
  next();
}