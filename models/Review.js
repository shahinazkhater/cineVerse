import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, min: 0, max: 10 },
    comment: { type: String, trim: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.statics.findByMovie = function (movieId) {
  return this.find({ movie: movieId })
    .populate("user", "username image")
    .sort({ createdAt: -1 });
};

reviewSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId })
    .populate("movie", "title year image")
    .sort({ createdAt: -1 });
};

export default mongoose.model("Review", reviewSchema);