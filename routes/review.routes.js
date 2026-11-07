import { Router } from "express";
import Review from "../models/Review.js";
import Movie from "../models/Movie.js";
import checkAuth from "../middleware/checkAuth.js";
import validateBody from "../middleware/validateBody.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validation-schemas/review.schema.js";

const router = Router();

// handler مشترك: بيتستخدم هنا (/api/reviews/:movieId) وفي movie.routes (/api/movies/:id/reviews)
export async function addReview(req, res) {
  const movieId = req.params.id ?? req.params.movieId;

  const movie = await Movie.exists({ _id: movieId });
  if (!movie) return res.status(404).json({ error: "movie not found" });

  const review = await Review.create({
    number: req.body.number,
    comment: req.body.comment,
    movie: movieId,
    user: req.user._id,
  });

  res.status(201).json({ message: "review added successfully", data: review });
}

// GET /api/reviews/my
router.get("/my", checkAuth, async (req, res) => {
  const reviews = await Review.findByUser(req.user._id);
  res.json({ data: reviews });
});

// POST /api/reviews/:movieId
router.post(
  "/:movieId",
  checkAuth,
  validateObjectId("movieId"),
  validateBody(createReviewSchema),
  addReview
);

// PATCH /api/reviews/:id  (صاحب الريفيو بس)
router.patch(
  "/:id",
  checkAuth,
  validateObjectId(),
  validateBody(updateReviewSchema),
  async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "review not found" });

    if (!review.user.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "you are not authorized to update this review" });
    }

    if (req.body.number !== undefined) review.number = req.body.number;
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    await review.save();

    res.json({ message: "review updated successfully", data: review });
  }
);

// DELETE /api/reviews/:id  (صاحب الريفيو بس)
router.delete("/:id", checkAuth, validateObjectId(), async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ error: "review not found" });

  if (!review.user.equals(req.user._id)) {
    return res
      .status(403)
      .json({ error: "you are not authorized to delete this review" });
  }

  await review.deleteOne();
  res.json({ message: "review deleted successfully" });
});

export default router;