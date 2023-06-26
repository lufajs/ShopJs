const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getMainPage);

router.get("/product/:productId", shopController.getProductPage);

router.post("/search-products", shopController.postSearchProduct);

router.get("/results", shopController.getResultsPage);

router.get("/seller/:userName", shopController.getSellerPage);

router.get("/electronics", shopController.getElectronicsPage);
router.get("/sport", shopController.getSportPage);
router.get("/automotive", shopController.getAutomotivePage);
router.get("/fashion", shopController.getFashionPage);

router.get("/favorites", isAuth, shopController.getFavoritesPage);
router.post("/favorites/:productId", isAuth, shopController.postFavorites);
router.post(
  "/remove-favorites/:productId",
  isAuth,
  shopController.postRemoveFavorites
);

router.get("/cart", isAuth, shopController.getCartPage);
router.post("/cart/:productId", isAuth, shopController.postCart);
router.post("/cart-delete/", isAuth, shopController.postDeleteCart);

router.get("/info", shopController.getInfoPage);

router.get("/checkout", isAuth, shopController.getCheckoutPage);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("/orders", isAuth, shopController.getOrdersPage);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
