exports.get404Page = (req, res, next) => {
  res.status(404).render("404", {
    isAuth: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    userName: req.session.user || "",
  });
};
