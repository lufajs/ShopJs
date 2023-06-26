const express = require("express");
const { check, body } = require("express-validator");

const myShopController = require("../controllers/myShop");

const router = express.Router();

router.get("/", myShopController.getMainPage);

router.get("/add-product", myShopController.getAddProductPage);
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
  myShopController.postAddProduct
);

router.get("/my-products", myShopController.getMyProductsPage);
router.delete("/my-products/:productId", myShopController.deleteUserProduct);

module.exports = router;
