const express = require("express");
const { check, body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

router.get("/", isAdmin, adminController.getAdminPage);

router.get("/add-product", isAdmin, adminController.getAddProductPage);
router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Title is invalid")
      .isLength({ max: 15 })
      .withMessage("Title is too long")
      .trim(),
    body("price")
      .isFloat()
      .withMessage("Price is invalid")
      .isLength({ max: 10 })
      .withMessage("Price is too big"),
    body("description")
      .isLength({ max: 75 })
      .withMessage("Description is too long")
      .trim(),
    body("condition").not().isEmpty().withMessage("Select condition"),
    body("category").not().isEmpty().withMessage("Select category"),
  ],
  isAdmin,
  adminController.postAddProduct
);

router.get("/product-list", isAdmin, adminController.getProductList);
router.delete(
  "/product-list/:productId",
  isAdmin,
  adminController.deleteProduct
);

router.get("/user-list", isAdmin, adminController.getUserList);
router.delete("/user-list/:userId", isAdmin, adminController.deleteUser);

router.get("/confirm-product", isAdmin, adminController.getConfirmProductPage);
router.post(
  "/confirm-product/:productId",
  isAdmin,
  adminController.postConfirmProduct
);
router.post(
  "/deny-product/:productId",
  isAdmin,
  adminController.postDenyProduct
);

module.exports = router;
