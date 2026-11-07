import { z } from "zod";
import { removeUploaded } from "./upload.js";

export default function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ ...(req.body ?? {}) });
    if (!result.success) {
      removeUploaded(req);
      const tree = z.treeifyError(result.error);
      return res.status(422).json({ errors: tree.properties ?? {} });
    }
    req.body = result.data;
    next();
  };
}