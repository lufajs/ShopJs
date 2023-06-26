const path = require("path");
const fs = require("fs");

const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const stripe = require("stripe")(process.env.STRIPE);

PDFDocument = require("pdfkit");

exports.postSearchProduct = async (req, res, next) => {
  let payload = req.body.payload.trim();
  let search = await Product.find({
    title: { $regex: new RegExp("^" + payload + ".*", "i") },
  }).exec();
  search = search.slice(0, 10);
  res.send({ payload: search });
};

exports.getResultsPage = (req, res, next) => {
  let result = req.query.search;
  const regex1 = new RegExp(result, "i");
  Product.find({
    title: { $regex: regex1 },
  })
    .then((products) => {
      res.render("shop/b-searchResult", {
        prods: products,
        result: result,
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        userName: req.session.user || "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSellerPage = (req, res, next) => {
  const userName = req.params.userName;
  User.findOne({
    username: userName,
  })
    .populate("products.items.productId")
    .then((user) => {
      const products = user.products.items;
      res.render("shop/b-sellerProducts.ejs", {
        prods: products,
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        userName: req.session.user || "",
        username: userName,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getMainPage = (req, res, next) => {
  Product.aggregate([{ $sample: { size: 5 } }])
    .then((products) => {
      res.render("shop/b-main", {
        prods: products,
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        userName: req.session.user || "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductPage = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      User.findById(product.userId).then((user) => {
        const username = user.username;
        res.render("shop/b-product", {
          isAuth: req.session.isLoggedIn,
          isAdmin: req.session.isAdmin,
          userName: req.session.user || "",
          prod: product,
          username: username,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getFavoritesPage = (req, res, next) => {
  req.user.populate("favorites.items.productId").then((user) => {
    const products = user.favorites.items;
    res.render("shop/b-ctrls-favorites", {
      prods: products,
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  });
};
exports.postFavorites = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToFavorites(product);
    })
    .then((result) => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postRemoveFavorites = (req, res, next) => {
  const productId = req.params.productId;
  req.user
    .removeFromFavorites(productId)
    .then((result) => {
      res.status(200).json({ message: "Deleted" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Failed" });
    });
};

exports.getNotificationsPage = (req, res, next) => {
  res.render("shop/b-ctrls-notifications", {
    isAuth: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    userName: req.session.user || "",
  });
};

exports.getCartPage = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    const product = user.cart.items;
    let totalPrice = 0;
    product.forEach((prod) => {
      totalPrice += prod.productId.price * prod.quantity;
    });
    res.render("shop/b-ctrls-cart", {
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
      prods: product,
      totalPrice: totalPrice,
    });
  });
};
exports.postCart = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Failed" });
    });
};
exports.postDeleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getInfoPage = (req, res, next) => {
  res.render("shop/b-ctrls-info", {
    isAuth: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    userName: req.session.user || "",
  });
};

exports.getElectronicsPage = (req, res, next) => {
  Product.find().then((products) => {
    res.render("shop/b-category", {
      prods: products,
      ctg: "Electronics",
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  });
};

exports.getAutomotivePage = (req, res, next) => {
  Product.find().then((products) => {
    res.render("shop/b-category", {
      prods: products,
      ctg: "Automotive",
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  });
};

exports.getSportPage = (req, res, next) => {
  Product.find().then((products) => {
    res.render("shop/b-category", {
      prods: products,
      ctg: "Sport",
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  });
};

exports.getFashionPage = (req, res, next) => {
  Product.find().then((products) => {
    res.render("shop/b-category", {
      prods: products,
      ctg: "Fashion",
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
    });
  });
};

exports.getCheckoutPage = (req, res, next) => {
  let product;
  let totalPrice = 0;
  if (req.user.cart.items.length === 0) {
    return res.redirect("/cart");
  }
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      product = user.cart.items;
      totalPrice = 0;
      product.forEach((prod) => {
        totalPrice += prod.productId.price * prod.quantity;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: product.map((p) => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: "pln",
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
            },
          };
        }),
        customer_email: req.user.email,
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/b-checkout.ejs", {
        isAuth: req.session.isLoggedIn,
        isAdmin: req.session.isAdmin,
        userName: req.session.user || "",
        prods: product,
        totalPrice: totalPrice,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const product = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: product,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrdersPage = (req, res, next) => {
  Order.find({ "user.userId": req.user._id }).then((orders) => {
    res.render("shop/b-orders.ejs", {
      isAuth: req.session.isLoggedIn,
      isAdmin: req.session.isAdmin,
      userName: req.session.user || "",
      orders: orders,
    });
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        console.log("No orders yet");
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        res.redirect("/");
        return console.log("Unauthorized");
      }
      const invoiceName = "Invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename='" + invoiceName + "'"
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("----------------------------");
      let totalPrice = 0;
      order.products.forEach((p) => {
        totalPrice += p.quantity * p.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            p.product.title + " - " + p.quantity + " x " + "$" + p.product.price
          );
      });
      pdfDoc.text("---------");
      pdfDoc.fontSize(20).text("Total price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
    });
};
