import { Router } from "express";
import Movie from "../models/Movie.js";
import Actor from "../models/Actor.js";
import checkAuth from "../middleware/checkAuth.js";
import validateBody from "../middleware/validateBody.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { uploadImage, deleteFile, removeUploaded } from "../middleware/upload.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validation-schemas/movie.schema.js";
import { createReviewSchema } from "../validation-schemas/review.schema.js";
import { addReview } from "./review.routes.js";

const router = Router();

// تأكد إن كل الـ actors الموجودين فعلاً
async function actorsExist(ids = []) {
  const unique = [...new Set(ids)];
  const count = await Actor.countDocuments({ _id: { $in: unique } });
  return count === unique.length;
}

const actorsError = {
  errors: { actors: { errors: ["one or more actors do not exist"] } },
};

// GET /api/movies?search=&actor=
router.get("/", async (req, res) => {
  const { search, actor } = req.query;
  if (actor !== undefined && !/^[0-9a-fA-F]{24}$/.test(actor)) {
    return res.status(400).json({ error: "invalid id" });
  }
  const movies = await Movie.searchMovies({ search, actor });
  res.json({ data: movies });
});

// GET /api/movies/:id
router.get("/:id", validateObjectId(), async (req, res) => {
  const movie = await Movie.findById(req.params.id)
    .populate("actors")
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } },
      populate: { path: "user", select: "username image" },
    });

  if (!movie) return res.status(404).json({ error: "movie not found" });
  res.json({ data: movie });
});

// POST /api/movies
router.post(
  "/",
  checkAuth,
  uploadImage,
  validateBody(createMovieSchema),
  async (req, res) => {
    if (req.body.actors && !(await actorsExist(req.body.actors))) {
      removeUploaded(req);
      return res.status(422).json(actorsError);
    }

    const movie = await Movie.create({
      ...req.body,
      image: req.file?.filename ?? null,
    });

    res.status(201).json({ message: "movie created successfully", data: movie });
  }
);

// PATCH /api/movies/:id
router.patch(
  "/:id",
  checkAuth,
  validateObjectId(),
  uploadImage,
  validateBody(updateMovieSchema),
  async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      removeUploaded(req);
      return res.status(404).json({ error: "movie not found" });
    }

    if (req.body.actors && !(await actorsExist(req.body.actors))) {
      removeUploaded(req);
      return res.status(422).json(actorsError);
    }

    Object.assign(movie, req.body);

    if (req.file) {
      deleteFile(movie.image); // امسح البوستر القديم
      movie.image = req.file.filename;
    }

    await movie.save();
    res.json({ message: "movie updated successfully", data: movie });
  }
);

// DELETE /api/movies/:id  (الـ hook في الموديل بيمسح الريفيوهات)
router.delete("/:id", checkAuth, validateObjectId(), async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return res.status(404).json({ error: "movie not found" });

  deleteFile(movie.image);
  res.json({ message: "movie deleted successfully" });
});

// POST /api/movies/:id/reviews
router.post(
  "/:id/reviews",
  checkAuth,
  validateObjectId(),
  validateBody(createReviewSchema),
  addReview
);

export default router;