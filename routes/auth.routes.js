import { Router } from "express";
import User from "../models/User.js";
import Session from "../models/Session.js";
import checkAuth, { SESSION_COOKIE } from "../middleware/checkAuth.js";
import validateBody from "../middleware/validateBody.js";
import { uploadImage, removeUploaded } from "../middleware/upload.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation-schemas/auth.schema.js";

const router = Router();
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// POST /auth/register  (مفيش session هنا، لازم يعمل login بعدها)
router.post("/register", uploadImage, validateBody(registerSchema), async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.exists({ email });
  if (exists) {
    removeUploaded(req);
    return res
      .status(422)
      .json({ errors: { email: { errors: ["email already in use"] } } });
  }

  const user = await User.create({
    username,
    email,
    password,
    image: req.file?.filename ?? null,
  });

  res.status(201).json({
    message: "register successful, you can now login",
    data: { user },
  });
});

// POST /auth/login
router.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const session = await Session.createSession(user._id);

  res.cookie(SESSION_COOKIE, session.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SEVEN_DAYS,
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ message: "login successful", data: { user } });
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) await Session.deleteOne({ sessionId });
  res.clearCookie(SESSION_COOKIE);
  res.json({ message: "logout successful" });
});

// POST /auth/forgot-password
router.post("/forgot-password", validateBody(forgotPasswordSchema), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ error: "user with this email does not exist" });
  }

  const otp = user.generateOtp();
  await user.save();

  // حسب الـ documentation الـ OTP بيرجع في الـ response
  res.json({ message: "otp generated successfully", otp });
});

// POST /auth/reset-password
router.post("/reset-password", validateBody(resetPasswordSchema), async (req, res) => {
  const { email, otp, new_password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.verifyOtp(otp)) {
    return res.status(400).json({ error: "invalid or expired otp" });
  }

  user.password = new_password; // الـ pre-save hook هيشفره
  user.clearOtp();
  await user.save();

  await Session.deleteMany({ user: user._id }); // اقفل كل الجلسات القديمة

  res.json({ message: "password reset successful, you can now login" });
});

// GET /auth/me
router.get("/me", checkAuth, (req, res) => {
  res.json({ data: { user: req.user } });
});

export default router;