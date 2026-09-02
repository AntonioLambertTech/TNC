function getCart() {
  const raw = sessionStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  sessionStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(item, size, qty) {
  const cart = getCart();
  const existing = cart.find(function (line) {
    return line.itemId === item.itemId && line.size === size;
  });

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      itemId: item.itemId,
      name: item.name,
      price: item.price,
      size: size,
      qty: qty,
      imageUrl: item.imageUrl
    });
  }

  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(itemId, size) {
  const cart = getCart().filter(function (line) {
    return !(line.itemId === itemId && line.size === size);
  });
  saveCart(cart);
  renderCartDrawer();
}

function cartTotal(cart) {
  return cart.reduce(function (sum, line) { return sum + line.price * line.qty; }, 0);
}

function updateCartCount() {
  const count = getCart().reduce(function (sum, line) { return sum + line.qty; }, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count;
}

function renderCartDrawer() {
  const cart = getCart();
  const list = document.getElementById("cart-items");
  list.innerHTML = "";

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "Your cart is empty.";
    list.appendChild(empty);
  }

  cart.forEach(function (line) {
    const row = document.createElement("div");
    row.className = "cart-row";

    const img = document.createElement("img");
    img.src = line.imageUrl || "images/placeholder.png";
    img.alt = line.name;
    row.appendChild(img);

    const info = document.createElement("div");
    info.className = "cart-row-info";
    info.innerHTML =
      "<strong>" + escapeHtml(line.name) + "</strong>" +
      "<span>Size " + escapeHtml(line.size) + " &middot; Qty " + line.qty + "</span>" +
      "<span>$" + (line.price * line.qty).toFixed(2) + "</span>";
    row.appendChild(info);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-line";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      removeFromCart(line.itemId, line.size);
    });
    row.appendChild(removeBtn);

    list.appendChild(row);
  });

  document.getElementById("cart-total").textContent = "$" + cartTotal(cart).toFixed(2);
  document.getElementById("checkout-btn").disabled = cart.length === 0;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function openCartDrawer() {
  renderCartDrawer();
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();

  const cartToggle = document.getElementById("cart-toggle");
  if (cartToggle) cartToggle.addEventListener("click", openCartDrawer);

  const cartClose = document.getElementById("cart-close");
  if (cartClose) cartClose.addEventListener("click", closeCartDrawer);

  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCartDrawer);
});
