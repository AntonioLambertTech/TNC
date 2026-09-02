document.addEventListener("DOMContentLoaded", function () {
  const checkoutBtn = document.getElementById("checkout-btn");
  const modal = document.getElementById("checkout-modal");
  const overlay = document.getElementById("checkout-overlay");
  const closeBtn = document.getElementById("checkout-close");
  const form = document.getElementById("checkout-form");
  const statusMsg = document.getElementById("checkout-status");

  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", function () {
    modal.classList.add("open");
    overlay.classList.add("open");
  });

  function closeModal() {
    modal.classList.remove("open");
    overlay.classList.remove("open");
  }
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusMsg.textContent = "Sending you to payment...";
    statusMsg.className = "checkout-status";

    const cart = getCart();
    if (!cart.length) {
      statusMsg.textContent = "Your cart is empty.";
      statusMsg.className = "checkout-status error";
      return;
    }

    const customer = {
      name: document.getElementById("customer-name").value.trim(),
      email: document.getElementById("customer-email").value.trim(),
      phone: document.getElementById("customer-phone").value.trim(),
      address: document.getElementById("customer-address").value.trim()
    };

    const fileInput = document.getElementById("design-upload");
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        sendOrder(customer, cart, reader.result, statusMsg);
      };
      reader.readAsDataURL(file);
    } else {
      sendOrder(customer, cart, null, statusMsg);
    }
  });
});

function sendOrder(customer, cart, designImageBase64, statusMsg) {
  const payload = {
    action: "createCheckout",
    customer: customer,
    items: cart,
    designImageBase64: designImageBase64,
    successUrl: window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "order-success.html",
    cancelUrl: window.location.href
  };

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.checkoutUrl) {
        sessionStorage.removeItem("cart");
        window.location.href = data.checkoutUrl;
      } else {
        statusMsg.textContent = "Something went wrong starting checkout. Please try again.";
        statusMsg.className = "checkout-status error";
      }
    })
    .catch(function () {
      statusMsg.textContent = "Could not reach the payment system. Please try again.";
      statusMsg.className = "checkout-status error";
    });
}
