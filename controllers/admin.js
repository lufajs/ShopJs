const { validationResult } = require("express-validator");

const Product = require("../models/product");
const AwaitProduct = require("../models/awaitProduct");
const User = require("../models/user");
const fileHelper = require("../util/file");

exports.getAdminPage = (req, res, next) => {
  res.render("admin/d-admin", {});
};

exports.getAddProductPage = (req, res, next) => {
  res.render("admin/d-addProduct", {
    errorMessage: req.flash("error"),
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
    return res.status(422).render("admin/d-addProduct", {
      errorMessage: "No image provided",
      oldInput: {
        title: title,
        description: description,
        price: price,
      },
      validationErrors: [],
    });
  }

  const imageUrl = image.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fileHelper.deleteFile(imageUrl);
    return res.status(422).render("admin/d-addProduct", {
      errorMessage: errors.array()[0].msg,
      oldInput: {
        title: title,
        description: description,
        price: price,
      },
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    userId: userId,
    title: title,
    price: price,
    category: category,
    condition: condition,
    image: imageUrl,
    description: description,
  });

  product
    .save()
    .then((result) => {
      User.findById(userId).then((user) => {
        user.products.items.push({ productId: product._id });
        user.save();
      });
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductList = (req, res, next) => {
  Product.find()
    .populate("userId")
    .sort({ _id: -1 })
    .then((prods) => {
      res.render("admin/d-productList", {
        prods: prods,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
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
      });
      fileHelper.deleteFile(product.image);
      return Product.deleteOne({ _id: prodId });
    })
    .then(() => {
      res.status(200).json({ message: "success" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deleting book failed" });
    });
};

exports.getUserList = (req, res, next) => {
  User.find()
    .sort({ _id: -1 })
    .then((users) => {
      res.render("admin/d-userList", {
        users: users,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .deleteOne()
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Failed" });
    });
};

exports.getConfirmProductPage = (req, res, next) => {
  AwaitProduct.find()
    .then((products) => {
      res.render("admin/d-confirmProduct", {
        prods: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postConfirmProduct = (req, res, next) => {
  prodId = req.params.productId;
  AwaitProduct.findById(prodId)
    .then((awaitProd) => {
      const product = new Product({
        _id: awaitProd._id,
        userId: awaitProd.userId,
        title: awaitProd.title,
        price: awaitProd.price,
        category: awaitProd.category,
        condition: awaitProd.condition,
        image: awaitProd.image,
        description: awaitProd.description,
      });
      product.save();
      User.findById(awaitProd.userId).then((user) => {
        user.products.items.push({ productId: awaitProd._id });
        user.save();
      });
      return AwaitProduct.findById(prodId).deleteOne();
    })
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Failed" });
    });
};
exports.postDenyProduct = (req, res, next) => {
  prodId = req.params.productId;
  AwaitProduct.findById(prodId)
    .then((product) => {
      fileHelper.deleteFile(product.image);
      product.deleteOne();
    })
    .then(() => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Failed" });
    });
};
