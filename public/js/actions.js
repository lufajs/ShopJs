const deleteProduct = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId]").value;

  const product = btn.closest("div.product");

  fetch("/admin/product-list/" + prodId, {
    method: "DELETE",
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      product.parentNode.removeChild(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteUserProduct = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId]").value;

  const product = btn.closest("div.product");

  fetch("/my-shop/my-products/" + prodId, {
    method: "DELETE",
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      product.parentNode.removeChild(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteUser = (btn) => {
  btn.disabled = true;
  const userId = btn.parentNode.querySelector("[name=userId]").value;

  const product = btn.closest("div.product");

  fetch("/admin/user-list/" + userId, {
    method: "DELETE",
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      product.parentNode.removeChild(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

const confirmProduct = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const product = btn.closest("div.product");
  fetch("/admin/confirm-product/" + prodId, {
    method: "POST",
  })
    .then((result) => {
      return result.json();
    })
    .then(() => {
      product.parentNode.removeChild(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

const denyProduct = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const product = btn.closest("div.product");
  fetch("/admin/deny-product/" + prodId, {
    method: "POST",
  })
    .then((result) => {
      return result.json();
    })
    .then(() => {
      product.parentNode.removeChild(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

const addToCart = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const item = document.querySelector("[id=cart]");
  fetch("/cart/" + prodId, {
    method: "POST",
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      item.style.color = "#5aff39";
    })
    .catch((err) => {
      console.log(err);
    });
};

const addFavorite = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const item = btn.parentNode.querySelector("[id=addFav]");
  fetch("/favorites/" + prodId, {
    method: "POST",
  })
    .then((result) => {
      item.style.color = "#ff00dd";
    })
    .catch((err) => {
      console.log(err);
    });
};

const removeFavorite = (btn) => {
  btn.disabled = true;
  const prodId = btn.parentNode.querySelector("[name=productId").value;
  const item = btn.closest("div.product");
  fetch("/remove-favorites/" + prodId, {
    method: "POST",
  })
    .then(() => {
      item.parentNode.removeChild(item);
    })
    .catch((err) => {
      console.log(err);
    });
};
