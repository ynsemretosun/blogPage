const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Kullanıcı adı gereklidir!"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email adresi gereklidir!"],
    unique: true,
    validate: [validator.isEmail, "Lütfen geçerli bir mail adresi giriniz!"],
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Şifre gereklidir!"],
    minLenght: [8, "Şifre minimum 8 karakterden oluşmalıdır!"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Lütfen girmiş olduğunuz şifreyi onaylayınız!"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "Şifreler uyuşmuyor!",
    },
    minLength: [8, "Şifre minimum 8 karakterden oluşmalıdır!"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  //hash password with 12 length salt
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  console.log(candidatePassword, userPassword);
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
