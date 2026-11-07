import { z } from "zod";

const required = (name) =>
  z.string({ error: `${name} is required` }).trim().min(1, `${name} is required`);

const email = z
  .string({ error: "email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("email must be a valid email"));

const strongPassword = (name) =>
  z
    .string({ error: `${name} is required` })
    .min(8, `${name} must be at least 8 characters`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      `${name} must contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character`
    );

export const registerSchema = z
  .object({
    username: required("username").min(2, "username must be at least 2 characters"),
    email,
    password: strongPassword("password"),
    password_confirmation: required("password_confirmation"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "password_confirmation must match password",
  });

export const loginSchema = z.object({
  email,
  password: required("password"),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    email,
    otp: z
      .string({ error: "otp is required" })
      .regex(/^\d{6}$/, "otp must be 6 digits"),
    new_password: strongPassword("new_password"),
    new_password_confirmation: required("new_password_confirmation"),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    path: ["new_password_confirmation"],
    message: "new_password_confirmation must match new_password",
  });