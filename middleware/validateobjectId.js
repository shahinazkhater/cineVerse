const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export default function validateObjectId(param = "id") {
  return (req, res, next) => {
    if (!OBJECT_ID.test(req.params[param])) {
      return res.status(400).json({ error: "invalid id" });
    }
    next();
  };
}