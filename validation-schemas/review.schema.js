import { z } from "zod";

export const createReviewSchema = z.object({
  number: z.coerce
    .number({ error: "rating must be between 0 and 10" })
    .min(0, "rating must be between 0 and 10")
    .max(10, "rating must be between 0 and 10"),
  comment: z.string().trim().optional(),
});

export const updateReviewSchema = createReviewSchema
  .partial()
  .refine((d) => d.number !== undefined || d.comment !== undefined, {
    path: ["number"],
    message: "provide number or comment to update",
  });