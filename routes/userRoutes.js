const express = require("express");
const User = require("../models/userModel");

const morgan = require("morgan");
const router = express.Router();
const { sign, verify } = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const app = express();
app.use(morgan("combined"));
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Bu işlemi yapmaya yetkiniz yok!", 403));
    }
    next();
  };
};
const protect = catchAsync(async (req, res, next) => {
  //Getting token and check its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("Lütfen giriş yaptıktan sonra tekrar deneyiniz!", 401)
    );
  }
  //Validate token
  const decoded = await promisify(verify)(token, process.env.JWT_SECRET);
  //Check user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("Bu tokene sahip kullanıcı mevcut değil!", 401));

  req.user = currentUser;
  next();
});

const signToken = (id) => {
  return sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};
if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

router.patch(
  "/updateMe",
  protect,
  catchAsync(async (req, res) => {
    const { username, email } = req.body;
    console.log(username, email);
    if (!username || !email) {
      return res.status(400).json({
        status: "error",
        message: "Lütfen tüm alanları doldurunuz!",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Kullanıcı bulunamadı!",
      });
    }
    await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      message: "Kullanıcı başarıyla güncellendi!",
    });
  })
);

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm } = req.body;
    if (!username || !email || !password || !passwordConfirm) {
      return next(new AppError("Lütfen tüm alanları doldurunuz", 400));
    }
    const newUser = await User.create({
      username,
      email,
      password,
      passwordConfirm,
    });
    createSendToken(newUser, 201, res);
  })
);

router.post(
  "/login",
  catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    //Check username and password exist?
    if (!username || !password) {
      return next(new AppError("Lütfen kullanıcı adı ve şifre giriniz!", 404));
    }

    //Check user exists && password is correct?
    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Kullanıcı adı veya şifre hatalı!", 401));
    }
    //If everything is ok, then send token to client!
    createSendToken(user, 200, res);
  })
);

router.get(
  "/logout",
  catchAsync(async (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ status: "success" });
  })
);

router.get(
  "/getMe",
  protect,
  catchAsync(async (req, res) => {
    console.log(req.user.id);
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  })
);

router.delete(
  "/deleteMe",
  protect,
  catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id);
    res.status(204).json({
      status: "success",
      message: "Kullanıcı başarıyla silindi!",
    });
  })
);

router.patch(
  "/changePassword",
  protect,
  catchAsync(async (req, res) => {
    const { password, newPassword, newPasswordConfirm } = req.body;
    if (!password || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: "error",
        message: "Lütfen tüm alanları doldurunuz!",
      });
    }
    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "error",
        message: "Eski şifre hatalı!",
      });
    }
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    createSendToken(user, 200, res);
  })
);

router.get(
  "/",
  protect,
  restrictTo("admin"),
  catchAsync(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  })
);

router.get(
  "/:id",
  protect,
  restrictTo("admin"),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Kullanıcı bulunamadı!",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  })
);

router.post(
  "/createUser",
  protect,
  restrictTo("admin"),
  catchAsync(async (req, res) => {
    const { username, email, password, passwordConfirm, role } = req.body;
    if (!username || !email || !password || !passwordConfirm || !role) {
      return res.status(400).json({
        status: "error",
        message: "Lütfen tüm alanları doldurunuz!",
      });
    }
    const newUser = await User.create({
      username,
      email,
      password,
      passwordConfirm,
      role,
    });
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
      message: "Kullanıcı başarıyla oluşturuldu!",
    });
  })
);

router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { username, email, role } = req.body;
    if (!username || !email || !role) {
      return res.status(400).json({
        status: "error",
        message: "Lütfen tüm alanları doldurunuz!",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Kullanıcı bulunamadı!",
      });
    }

    const newUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        user: newUser,
      },
      message: "Kullanıcı başarıyla güncellendi!",
    });
  })
);

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Kullanıcı başarıyla silindi!",
    });
  })
);

module.exports = router;
