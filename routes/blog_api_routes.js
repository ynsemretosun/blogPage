/*
Node.js ve Express.js kullanarak blog projesi için gerekli yönetim sistemlerinde kullanmak üzere
CRUD (Create Read Update Delete) için gerekli API'ler yazalım.
Yazacağımız API ile MongoDB veritabanında blog projemiz için yazma, okuma, silme, güncelleme işlemleri yapacağız.
Aşağıdaki kodta Exress.js yardımıyla Router  nesnesini farklı HTTP isteklerine cevap verebilecek API ile router yapılar oluşturulacaktır.
*/

/*
http://localhost:1111/	index44.html açılacak
http://localhost:1111/blog	blog.ejs açılacak
http://localhost:1111/blog/api	JSON formatında blog listesi dönecek
http://localhost:1111/blog/api/:id	Belirli blogu getirecek
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Import Express (Express:  Node.js için esnek bir web uygulama çatısını inşa eder)
// Bu modüllerle beraber HTTP istekleri(request) işleyecek ve istemciye(server) yanıt dönecektir.

// Express Import
const express = require("express");

// Express için Log
const morgan = require("morgan");

// Express App
const app = express(); // Express app oluştur.

// Morgan Aktifleştirmek
// Morgan'ı Express.js uygulamasında kullanalım.
// app.use(morgan('dev')); //dev: kısa ve renkli loglar göster
app.use(morgan("combined")); //dev: uzun ve renkli loglar göster

// Router Import
const router = express.Router();

// Mongoose BlogPostSchema Import
const MongooseBlogModelApi = require("../models/mongoose_blog_models");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dikkat: `router.` sonda yapılacak işlemlerde sadece ama sadece get,post,put,delete
// Örnek:get(find, list), post(create), put(Güncelleme), delete(Silme) yazmak zorundayız.

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DRY Principle (Don't Repeat Yourself)
const handleError = (err, response, message) => {
  console.error(err);
  response.status(400).json({ message });
}; //end handleError

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const { verify } = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
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
  const decoded = await promisify(verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("Bu tokene sahip kullanıcı mevcut değil!", 401));

  req.user = currentUser;
  next();
});

router.post(
  "/",
  protect,
  catchAsync(async (request, response, next) => {
    const { header, content, tags, imageUrl } = request.body;
    console.log(header, content, tags);
    if (!header || !content || !tags) {
      return next(new AppError("Lütfen tüm alanları doldurunuz!", 400));
    }

    const newBlog = await MongooseBlogModelApi.create({
      header,
      content,
      author: request.user.username,
      tags,
      imageUrl,
    });

    response.status(201).json({
      status: "success",
      message: "Blog başarıyla oluşturuldu!",
      data: {
        blog: newBlog,
      },
    });
  })
);

/////////////////////////////////////////////////////////////////////////////////////////////
// LIST BLOG
// GET isteği ile mongodb üzerinden bütün verileri alacağız.
// http://localhost:1111
router.get(
  "/",
  catchAsync(async (req, res) => {
    const blogs = await MongooseBlogModelApi.find({ status: "published" })
      .sort({
        createdAt: -1,
      })
      .limit(6);

    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  })
); //end list => get

router.get(
  "/protected",
  protect,
  catchAsync(async (req, res) => {
    const role = req.user.role;
    let blogs = [];
    if (role !== "admin") {
      blogs = await MongooseBlogModelApi.find({ author: req.user.username });
    } else {
      blogs = await MongooseBlogModelApi.find();
    }

    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  })
);

/////////////////////////////////////////////////////////////////////////////////////////////

router.put(
  "/:id",
  protect,
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const role = request.user.role;
    const { header, content, tags } = request.body;
    if (!header || !content || !tags) {
      return response.status(400).json({
        message: "Lütfen tüm alanları doldurunuz!",
      });
    }
    const blog = await MongooseBlogModelApi.findById(id);
    if (!blog) {
      return response.status(404).json({
        message: "Blog bulunamadı!",
      });
    }
    if (role !== "admin" && blog.author !== request.user.username) {
      return response.status(403).json({
        message: "Bu işlemi yapmaya yetkiniz yok!",
      });
    }

    const newBlog = await blog.updateOne({
      header,
      content,
      tags,
    });

    response.status(200).json({
      status: "success",
      message: "Blog başarıyla güncellendi!",
      data: {
        blog: newBlog,
      },
    });
  })
); //end update => put

/////////////////////////////////////////////////////////////////////////////////////////////

router.delete(
  "/:id",
  protect,
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const role = request.user.role;
    const blog = await MongooseBlogModelApi.findById(id);
    if (!blog) {
      return response.status(404).json({
        message: "Blog bulunamadı!",
      });
    }
    if (role !== "admin" && blog.author !== request.user.username) {
      return response.status(403).json({
        status: "error",
        message: "Bu işlemi yapmaya yetkiniz yok!",
      });
    }
    await blog.deleteOne();
    response.status(204).json({
      status: "success",
      message: "Blog başarıyla silindi!",
    });
  })
); //end delete => delete

/////////////////////////////////////////////////////////////
// EXPORT
module.exports = router;

/////////////////////////////////////////////////////////////
// POSTMAN, cURL api test araçlarından bir tanesini kullanabilirsiniz.
/*
{
    "header": "başlık",
    "content": "başlık",
    "author": "Hamit Mızrak",
    "tags": "node",
}
*/
