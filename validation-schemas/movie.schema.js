import { z } from "zod";

const required = (name) =>
  z.string({ error: `${name} is required` }).trim().min(1, `${name} is required`);

// بيقبل array، أو string مفصولة بـ comma، أو JSON array string (الـ multipart بيبعت كده)
const toArray = (v) => {
  if (v === undefined || v === "") return undefined;
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (t.startsWith("[")) {
      try {
        return JSON.parse(t);
      } catch {
        return v;
      }
    }
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return v;
};

const youtubeRegex =
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/;

export const createMovieSchema = z.object({
  title: required("title"),
  year: z.coerce
    .number({ error: "year must be a number" })
    .int("year must be a whole number")
    .min(1888, "year must be 1888 or later")
    .max(2100, "year must be 2100 or earlier"),
  genres: z.preprocess(
    toArray,
    z
      .array(z.string().trim().min(1), { error: "genres is required" })
      .min(1, "at least one genre is required")
  ),
  description: required("description"),
  trailerLink: required("trailerLink").regex(
    youtubeRegex,
    "trailerLink must be a valid YouTube URL"
  ),
  director: required("director"),
  actors: z
    .preprocess(
      toArray,
      z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid actor id"), {
        error: "actors must be an array of ids",
      })
    )
    .optional(),
});

export const updateMovieSchema = createMovieSchema.partial();