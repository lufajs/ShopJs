const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const sendgrid = require("@sendgrid/mail");
const crypto = require("crypto");

const User = require("../models/user");

sendgrid.setApiKey(process.env.SENDGRID);

exports.getLoginPage = (req, res, next) => {
  res.render("auth/c-login", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
    isAuth: false,
    isAdmin: false,
    userName: false,
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/c-login", {
      errorMessage: errors.array()[0].msg,
      successMessage: "",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
      isAuth: false,
      isAdmin: false,
      userName: false,
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/c-login", {
          errorMessage: "Invalid email or password",
          successMessage: "",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
          isAuth: false,
          isAdmin: false,
          userName: false,
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            if (user.role === "admin") {
              req.session.isAdmin = true;
            }
            req.session.isLoggedIn = true;
            req.session.user = user.username;
            req.session.userData = user;
            return req.session.save(() => {
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/c-login", {
            errorMessage: "Invalid email or password",
            successMessage: "",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
            isAuth: false,
            isAdmin: false,
            userName: false,
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSignupPage = (req, res, next) => {
  res.render("auth/c-signup", {
    errorMessage: req.flash("error"),
    oldInput: {
      username: "",
      email: "",
      password: "",
    },
    validationErrors: [],
    isAuth: false,
    isAdmin: false,
    userName: false,
  });
};
exports.postSignup = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/c-signup", {
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
      isAuth: false,
      isAdmin: false,
      userName: false,
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        username: username,
        email: email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((createdUser) => {
      req.session.isLoggedIn = true;
      req.session.user = createdUser.username;
      req.session.userData = createdUser;
      return req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getResetPage = (req, res, next) => {
  res.render("auth/c-reset.ejs", {
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
    isAuth: false,
    isAdmin: false,
    userName: false,
  });
};
exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(422).render("auth/c-reset.ejs", {
            errorMessage: "No account found with that email",
            oldInput: {
              email: email,
            },
            validationErrors: [],
            isAuth: false,
            isAdmin: false,
            userName: false,
          });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        sendgrid.send({
          to: email,
          from: "lufadeveloping@gmail.com",
          subject: "Password reset",
          text: "!TEST!Shopjs password reset",
          html: `
          <p>!TEST! Click this link to reset your password</p>
          <a href="http://localhost:3000/reset/${token}">Reset Password</a>
          `,
        });
        user.save();
        res.render("auth/c-login", {
          errorMessage: "",
          successMessage: "Email has been sent",
          oldInput: {
            email: "",
            password: "",
          },
          validationErrors: [],
          isAuth: false,
          isAdmin: false,
          userName: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPasswordPage = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      res.render("auth/c-newPassword.ejs", {
        errorMessage: req.flash("error"),
        oldInput: {
          email: "",
          password: "",
        },
        userId: user._id.toString(),
        passwordToken: token,
        isAuth: false,
        isAdmin: false,
        userName: false,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/c-newPassword.ejs", {
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      userId: userId,
      passwordToken: passwordToken,
      isAuth: false,
      isAdmin: false,
      userName: false,
    });
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
