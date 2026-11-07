import mongoose from "mongoose";
import Review from "./Review.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genres: [String],
    description: { type: String, required: true },
    trailerLink: { type: String, required: true },
    image: { type: String, default: null },
    director: { type: String, required: true },
    actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual: كل الريفيوهات بتاعة الفيلم
movieSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "movie",
});

movieSchema.statics.searchMovies = function ({ search, actor } = {}) {
  const filter = {};
  if (typeof search === "string" && search.trim()) {
    filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
  }
  if (actor) filter.actors = actor;
  return this.find(filter).populate("actors").sort({ createdAt: -1 });
};

// cascade: لما الفيلم يتمسح، امسح كل الريفيوهات بتاعته
movieSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await Review.deleteMany({ movie: doc._id });
});

export default mongoose.model("Movie", movieSchema);