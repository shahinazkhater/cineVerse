import { Router } from "express";
import Actor from "../models/Actor.js";
import checkAuth from "../middleware/checkAuth.js";
import validateBody from "../middleware/validateBody.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { uploadImages, deleteFile, removeUploaded } from "../middleware/upload.js";
import {
  createActorSchema,
  updateActorSchema,
} from "../validation-schemas/actor.schema.js";

const router = Router();

// GET /api/actors?search=
router.get("/", async (req, res) => {
  const actors = await Actor.searchByName(req.query.search);
  res.json({ data: actors });
});

// GET /api/actors/:id
router.get("/:id", validateObjectId(), async (req, res) => {
  const actor = await Actor.findById(req.params.id).populate({
    path: "movies",
    select: "title year image",
  });
  if (!actor) return res.status(404).json({ error: "actor not found" });
  res.json({ data: actor });
});

// POST /api/actors
router.post(
  "/",
  checkAuth,
  uploadImages,
  validateBody(createActorSchema),
  async (req, res) => {
    const actor = await Actor.create({
      ...req.body,
      images: (req.files ?? []).map((f) => f.filename),
    });
    res.status(201).json({ message: "actor created successfully", data: actor });
  }
);

// PATCH /api/actors/:id  (لو رفعت صور جديدة بتستبدل القديمة)
router.patch(
  "/:id",
  checkAuth,
  validateObjectId(),
  uploadImages,
  validateBody(updateActorSchema),
  async (req, res) => {
    const actor = await Actor.findById(req.params.id);
    if (!actor) {
      removeUploaded(req);
      return res.status(404).json({ error: "actor not found" });
    }

    Object.assign(actor, req.body);

    if (req.files?.length) {
      actor.images.forEach(deleteFile);
      actor.images = req.files.map((f) => f.filename);
    }

    await actor.save();
    res.json({ message: "actor updated successfully", data: actor });
  }
);

// DELETE /api/actors/:id  (الـ hook بيشيله من كل الأفلام)
router.delete("/:id", checkAuth, validateObjectId(), async (req, res) => {
  const actor = await Actor.findByIdAndDelete(req.params.id);
  if (!actor) return res.status(404).json({ error: "actor not found" });

  actor.images.forEach(deleteFile);
  res.json({ message: "actor deleted successfully" });
});

export default router;