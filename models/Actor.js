import mongoose from "mongoose";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const actorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    images: [String],
    birthdate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual: الأفلام اللي الممثل شغال فيها
actorSchema.virtual("movies", {
  ref: "Movie",
  localField: "_id",
  foreignField: "actors",
});

actorSchema.statics.searchByName = function (search) {
  const filter = {};
  if (typeof search === "string" && search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
  }
  return this.find(filter).sort({ name: 1 });
};

// لما الممثل يتمسح، شيله من كل الأفلام
actorSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose
      .model("Movie")
      .updateMany({ actors: doc._id }, { $pull: { actors: doc._id } });
  }
});

export default mongoose.model("Actor", actorSchema);