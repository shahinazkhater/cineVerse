import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    image: { type: String, default: null },
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetOtp;
        delete ret.resetOtpExpires;
        return ret;
      },
    },
  }
);

// تشفير الباسورد قبل الحفظ (بس لو اتغير)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.generateOtp = function () {
  const otp = String(crypto.randomInt(100000, 1000000)); // 6 أرقام
  this.resetOtp = otp;
  this.resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة
  return otp;
};

userSchema.methods.verifyOtp = function (otp) {
  return (
    !!this.resetOtp &&
    this.resetOtp === String(otp) &&
    this.resetOtpExpires > new Date()
  );
};

userSchema.methods.clearOtp = function () {
  this.resetOtp = null;
  this.resetOtpExpires = null;
};

export default mongoose.model("User", userSchema);