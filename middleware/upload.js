import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

export const UPLOADS_DIR = path.resolve("uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) =>
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(
    Object.assign(new Error("only jpg, jpeg, png, webp, gif images are allowed"), {
      status: 422,
    })
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB للصورة، 5 صور
});

export const uploadImage = upload.single("image"); // فيلم / يوزر
export const uploadImages = upload.array("images", 5); // ممثل

export function deleteFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(UPLOADS_DIR, path.basename(filename)), () => {});
}

// لو الريكوست فشل بعد ما الصورة اترفعت، امسحها
export function removeUploaded(req) {
  if (req.file) deleteFile(req.file.filename);
  if (Array.isArray(req.files)) req.files.forEach((f) => deleteFile(f.filename));
}