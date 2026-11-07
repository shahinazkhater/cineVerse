import express from "express";
import cookieParser from "cookie-parser";
import { MulterError } from "multer";
import { connectDB } from "./db/index.js";
import { UPLOADS_DIR } from "./middleware/upload.js";
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import actorRoutes from "./routes/actor.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import { pagesRouter } from "./routes/pages.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/actors", actorRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(pagesRouter);

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid json body" });
  }
  if (err instanceof MulterError) {
    return res.status(422).json({ error: err.message });
  }
  const status = err.status ?? 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "internal server error" : err.message });
});

const PORT = process.env.PORT || 3000;

await connectDB();
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));