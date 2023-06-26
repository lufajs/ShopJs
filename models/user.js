const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "client",
    require: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  favorites: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  products: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQty = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQty = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQty;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQty,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.removeFromFavorites = function (productId) {
  const updatedFavItems = this.favorites.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.favorites.items = updatedFavItems;
  return this.save();
};

userSchema.methods.addToFavorites = function (product) {
  const favProductIndex = this.favorites.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  const updatedFavItems = [...this.favorites.items];

  if (favProductIndex >= 0) {
    return;
  } else {
    updatedFavItems.push({
      productId: product._id,
    });
    const updatedFav = {
      items: updatedFavItems,
    };
    this.favorites = updatedFav;
    return this.save();
  }
};

userSchema.methods.removeFromProducts = function (productId) {
  const updatedProdItems = this.products.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.products.items = updatedProdItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
