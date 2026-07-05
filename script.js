// ============================================
// TANKEY PHARMACY — shared site logic
// Cart, orders and messages are stored in the browser's localStorage.
// ============================================

/* ---------- helpers ---------- */
function formatNaira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}
function genRef(prefix) {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const stamp = Date.now().toString().slice(-5);
  return `${prefix}-${stamp}${rand}`;
}
function getCart() {
  try { return JSON.parse(localStorage.getItem("tankey_cart")) || []; }
  catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem("tankey_cart", JSON.stringify(cart));
  updateCartBadge();
}
function getOrders() {
  try { return JSON.parse(localStorage.getItem("tankey_orders")) || []; }
  catch (e) { return []; }
}
function saveOrders(orders) {
  localStorage.setItem("tankey_orders", JSON.stringify(orders));
}
function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

/* ---------- nav toggle (all pages) ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
    const expanded = links.classList.contains("open");
    toggle.setAttribute("aria-expanded", expanded);
  });
}

/* ---------- cart badge (all pages) ---------- */
function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  badge.textContent = cartCount(getCart());
}

/* ---------- PRODUCTS PAGE ---------- */
function initProductsPage() {
  const grid = document.getElementById("product-grid");
  if (!grid) return; // not on this page

  const searchInput = document.getElementById("product-search");
  const chipRow = document.getElementById("category-chips");
  const emptyState = document.getElementById("empty-state");
  const miniCart = document.getElementById("mini-cart");
  const miniCartCount = document.getElementById("mini-cart-count");
  const miniCartTotal = document.getElementById("mini-cart-total");

  let activeCategory = "All";
  let query = "";

  function currentQtyInCart(id) {
    const item = getCart().find(i => i.id === id);
    return item ? item.qty : 0;
  }

  function render() {
    const term = query.trim().toLowerCase();
    const filtered = TANKEY_PRODUCTS.filter(p => {
      const matchesCat = activeCategory === "All" || p.cat === activeCategory;
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.cat.toLowerCase().includes(term);
      return matchesCat && matchesTerm;
    });

    grid.innerHTML = "";
    if (filtered.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
      filtered.forEach(p => grid.appendChild(renderCard(p)));
    }
    refreshMiniCart();
  }

  function renderCard(p) {
    const card = document.createElement("article");
    card.className = "product-card";
    const qty = currentQtyInCart(p.id);
    card.innerHTML = `
      ${p.rx ? '<span class="rx-badge">Prescription</span>' : ""}
      <span class="product-cat">${p.cat}</span>
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <div class="product-foot">
        <span class="price">${formatNaira(p.price)}</span>
        <div class="qty-stepper" data-id="${p.id}">
          <button type="button" data-action="dec" aria-label="Decrease quantity">−</button>
          <span data-qty>${qty}</span>
          <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `;
    const stepper = card.querySelector(".qty-stepper");
    stepper.addEventListener("click", (e) => {
      const action = e.target.getAttribute("data-action");
      if (!action) return;
      changeQty(p, action === "inc" ? 1 : -1);
      stepper.querySelector("[data-qty]").textContent = currentQtyInCart(p.id);
      refreshMiniCart();
    });
    return card;
  }

  function changeQty(product, delta) {
    let cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += delta;
      if (existing.qty <= 0) cart = cart.filter(i => i.id !== product.id);
    } else if (delta > 0) {
      cart.push({ id: product.id, name: product.name, cat: product.cat, price: product.price, qty: 1 });
    }
    saveCart(cart);
  }

  function refreshMiniCart() {
    const cart = getCart();
    const count = cartCount(cart);
    if (count > 0) {
      miniCart.classList.remove("hidden");
      miniCartCount.textContent = `${count} item${count > 1 ? "s" : ""} in cart`;
      miniCartTotal.textContent = formatNaira(cartTotal(cart));
    } else {
      miniCart.classList.add("hidden");
    }
  }

  // category chips
  chipRow.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      chipRow.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.category;
      render();
    });
  });

  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });

  render();
}

/* ---------- ORDER PAGE (cart + refill request) ---------- */
function initOrderPage() {
  const cartList = document.getElementById("cart-list");
  if (!cartList) return; // not on this page

  const summaryTotal = document.getElementById("summary-total");
  const submitCartBtn = document.getElementById("submit-cart-btn");
  const cartConfirm = document.getElementById("cart-confirm");
  const cartConfirmRef = document.getElementById("cart-confirm-ref");

  const refillForm = document.getElementById("refill-form");
  const refillConfirm = document.getElementById("refill-confirm");
  const refillConfirmRef = document.getElementById("refill-confirm-ref");

  const pastOrdersList = document.getElementById("past-orders-list");
  const pastOrdersSection = document.getElementById("past-orders-section");

  // tabs
  document.querySelectorAll(".order-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".order-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".order-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });

  function renderCart() {
    const cart = getCart();
    cartList.innerHTML = "";
    if (cart.length === 0) {
      cartList.innerHTML = `<div class="empty-state">
        <p>Your cart is empty. Browse products and add items to get started.</p>
        <a class="btn btn-primary" href="products.html">Browse products</a>
      </div>`;
      submitCartBtn.disabled = true;
    } else {
      submitCartBtn.disabled = false;
      cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-row";
        row.innerHTML = `
          <div>
            <div class="name">${item.name}</div>
            <div class="cat">${item.cat}</div>
          </div>
          <div class="qty-stepper" data-id="${item.id}">
            <button type="button" data-action="dec" aria-label="Decrease quantity">−</button>
            <span data-qty>${item.qty}</span>
            <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
          <div class="price">${formatNaira(item.price * item.qty)}</div>
          <button type="button" class="remove-btn" data-remove="${item.id}">Remove</button>
        `;
        cartList.appendChild(row);
      });
    }
    summaryTotal.textContent = formatNaira(cartTotal(cart));
  }

  cartList.addEventListener("click", (e) => {
    const stepper = e.target.closest(".qty-stepper");
    const removeBtn = e.target.closest("[data-remove]");
    let cart = getCart();

    if (stepper) {
      const id = stepper.dataset.id;
      const action = e.target.getAttribute("data-action");
      const item = cart.find(i => i.id === id);
      if (item && action) {
        item.qty += action === "inc" ? 1 : -1;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveCart(cart);
        renderCart();
      }
    }
    if (removeBtn) {
      cart = cart.filter(i => i.id !== removeBtn.dataset.remove);
      saveCart(cart);
      renderCart();
    }
  });

  submitCartBtn.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) return;
    const ref = genRef("TNK");
    const order = {
      ref, type: "Product order", items: cart, total: cartTotal(cart),
      date: new Date().toISOString(),
    };
    const orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);
    saveCart([]);
    renderCart();
    renderPastOrders();
    cartConfirmRef.textContent = ref;
    cartConfirm.classList.add("show");
  });

  if (refillForm) {
    refillForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(refillForm);
      const ref = genRef("RXR");
      const order = {
        ref, type: "Refill request",
        name: data.get("name"), phone: data.get("phone"),
        medication: data.get("medication"), fulfillment: data.get("fulfillment"),
        notes: data.get("notes"),
        date: new Date().toISOString(),
      };
      const orders = getOrders();
      orders.unshift(order);
      saveOrders(orders);
      refillForm.reset();
      refillConfirmRef.textContent = ref;
      refillConfirm.classList.add("show");
      renderPastOrders();
    });
  }

  function renderPastOrders() {
    const orders = getOrders();
    if (orders.length === 0) {
      pastOrdersSection.style.display = "none";
      return;
    }
    pastOrdersSection.style.display = "block";
    pastOrdersList.innerHTML = "";
    orders.slice(0, 8).forEach(o => {
      const row = document.createElement("div");
      row.className = "past-order-row";
      const dateStr = new Date(o.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
      const detail = o.type === "Product order"
        ? `${o.items.length} item(s) · ${formatNaira(o.total)}`
        : `${o.medication}`;
      row.innerHTML = `
        <span class="ref">${o.ref}</span>
        <span>${o.type} — ${detail}</span>
        <span>${dateStr}</span>
      `;
      pastOrdersList.appendChild(row);
    });
  }

  renderCart();
  renderPastOrders();
}

/* ---------- CONTACT PAGE ---------- */
function initContactPage() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const confirm = document.getElementById("contact-confirm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const messages = JSON.parse(localStorage.getItem("tankey_messages")) || [];
    messages.unshift({
      name: data.get("name"), email: data.get("email"), message: data.get("message"),
      date: new Date().toISOString(),
    });
    localStorage.setItem("tankey_messages", JSON.stringify(messages));
    form.reset();
    confirm.classList.add("show");
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  updateCartBadge();
  initProductsPage();
  initOrderPage();
  initContactPage();
});
