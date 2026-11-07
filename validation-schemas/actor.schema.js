import { z } from "zod";

export const createActorSchema = z.object({
  name: z.string({ error: "name is required" }).trim().min(1, "name is required"),
  birthdate: z
    .preprocess(
      (v) => (v === "" ? undefined : v),
      z.coerce.date({ error: "birthdate must be a valid date (YYYY-MM-DD)" })
    )
    .optional(),
});

export const updateActorSchema = createActorSchema.partial();