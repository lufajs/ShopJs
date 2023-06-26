const { validationResult } = require("express-validator");

const AwaitProduct = require("../models/awaitProduct");
const Product = require("../models/product");
const User = require("../models/user");
const fileHelper = require("../util/file");

exports.getMainPage = (req, res, next) => {
  res.render("myShop/e-main.ejs", {
    isAuth: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    userName: req.session.user || "",
  });
};

exports.getAddProductPage = (req, res, next) => {
  res.render("myShop/e-add-product.ejs", {
    successMessage: req.flash("userSuccess"),
    errorMessage: req.flash("error"),
    isAuth: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    userName: req.session.user || "",
    oldInput: {
      image: "",
      title: "",
      description: "",
      price: "",
    },
    validationErrors: [],
  });
};
exports.postAddProduct = (req, res, next) => {
  const userId = req.user;
  const title = req.body.title;
  const price = req.body.price;
  const category = req.body.category;
  const condition = req.body.condition;
  const image = req.file;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("myShop/e-add-product.ejs", {
      successMessage: "",
      errorMessage: "No image provided",
      oldInput: {
        title: title,
        description: description,
        price: price,
      },
      validationErrors: [],
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  }

  const imageUrl = image.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fileHelper.deleteFile(image.path);
    return res.status(422).render("myShop/e-add-product.ejs", {
      successMessage: "",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        title: title,
        description: description,
        price: price,
      },
      validationErrors: errors.array(),
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  }

  const awaitProduct = new AwaitProduct({
    userId: userId,
    title: title,
    price: price,
    category: category,
    condition: condition,
    image: imageUrl,
    description: description,
  });

  awaitProduct
    .save()
    .then((result) => {
      res.render("myShop/e-add-product.ejs", {
        successMessage: "The product is awaiting for confirmation",
        errorMessage: req.flash("error"),
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        userName: req.session.user || "",
        oldInput: {
          image: "",
          title: "",
          description: "",
          price: "",
        },
        validationErrors: [],
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getMyProductsPage = (req, res, next) => {
  Product.find({ userId: req.session.userData._id })
    .then((product) => {
      res.render("myShop/e-my-products.ejs", {
        successMessage: req.flash("userSuccess"),
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        userName: req.session.user || "",
        prods: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteUserProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      User.find({ "favorites.items.productId": prodId }).then((users) => {
        users.forEach((user) => {
          user.removeFromFavorites(prodId);
        });
      });
      User.find({ "cart.items.productId": prodId }).then((users) => {
        users.forEach((user) => {
          user.removeFromCart(prodId);
        });
      });
      User.findById(product.userId).then((user) => {
        user.removeFromProducts(prodId);
        fileHelper.deleteFile(product.image);
        return Product.deleteOne({ _id: prodId });
      });
    })
    .then(() => {
      res.status(200).json({ message: "success" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting book failed" });
    });
};
