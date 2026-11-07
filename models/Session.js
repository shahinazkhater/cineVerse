import crypto from "node:crypto";
import mongoose from "mongoose";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + SEVEN_DAYS) },
  },
  { versionKey: false }
);

sessionSchema.statics.createSession = function (userId) {
  return this.create({
    sessionId: crypto.randomBytes(32).toString("hex"),
    user: userId,
  });
};

sessionSchema.statics.validateSession = async function (sessionId) {
  if (!sessionId) return null;
  const session = await this.findOne({ sessionId }).populate("user");
  if (!session) return null;
  if (session.expiresAt < new Date() || !session.user) {
    await session.deleteOne();
    return null;
  }
  return session;
};

export default mongoose.model("Session", sessionSchema);