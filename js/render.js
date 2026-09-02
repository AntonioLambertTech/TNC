function buildProductCard(item) {
  const card = document.createElement("article");
  card.className = "product-card";

  const img = document.createElement("img");
  img.className = "product-photo";
  img.src = item.imageUrl || "images/placeholder.png";
  img.alt = item.name;
  card.appendChild(img);

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = item.name;
  card.appendChild(name);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = "$" + item.price.toFixed(2);
  card.appendChild(price);

  if (item.sizes.length) {
    const sizeSelect = document.createElement("select");
    sizeSelect.className = "size-select";
    item.sizes.forEach(function (size) {
      const opt = document.createElement("option");
      opt.value = size.name;
      const soldOut = size.count !== null && size.count <= 0;
      opt.textContent = size.name + (soldOut ? " (sold out)" : "");
      opt.disabled = soldOut;
      sizeSelect.appendChild(opt);
    });
    card.appendChild(sizeSelect);

    const addBtn = document.createElement("button");
    addBtn.className = "add-to-cart";
    addBtn.textContent = "Add to cart";
    addBtn.addEventListener("click", function () {
      const size = sizeSelect.value;
      addToCart(item, size, 1);
    });
    card.appendChild(addBtn);
  } else {
    const outOfStock = document.createElement("p");
    outOfStock.className = "out-of-stock";
    outOfStock.textContent = "Currently unavailable";
    card.appendChild(outOfStock);
  }

  return card;
}

function renderHomepageSections(items) {
  const container = document.getElementById("sections-container");
  container.innerHTML = "";

  SECTIONS.forEach(function (section) {
    const sectionItems = itemsForSection(items, section).slice(0, ITEMS_PER_HOMEPAGE_SECTION);
    if (!sectionItems.length) return;

    const block = document.createElement("section");
    block.className = "shop-section";

    const heading = document.createElement("div");
    heading.className = "shop-section-heading";
    const title = document.createElement("h2");
    title.textContent = section.label;
    heading.appendChild(title);

    const seeAll = document.createElement("a");
    seeAll.className = "see-all-link";
    seeAll.href = "category.html?section=" + encodeURIComponent(section.id);
    seeAll.textContent = "See all in " + section.label;
    heading.appendChild(seeAll);

    block.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "product-grid";
    sectionItems.forEach(function (item) {
      grid.appendChild(buildProductCard(item));
    });
    block.appendChild(grid);

    container.appendChild(block);
  });
}

function renderCategoryPage(items) {
  const params = new URLSearchParams(window.location.search);
  const sectionId = params.get("section") || "all";
  const section = SECTIONS.find(function (s) { return s.id === sectionId; }) || SECTIONS[0];

  document.getElementById("category-title").textContent = section.label;

  const sectionItems = itemsForSection(items, section);
  const grid = document.getElementById("category-grid");
  grid.innerHTML = "";

  if (!sectionItems.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "No items in this section yet.";
    grid.appendChild(empty);
    return;
  }

  sectionItems.forEach(function (item) {
    grid.appendChild(buildProductCard(item));
  });
}
