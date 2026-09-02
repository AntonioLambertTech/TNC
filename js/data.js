/* Reads the Inventory sheet (published as CSV) and turns each row into
   a clean item object the rest of the site can use.

   Expected columns in the sheet (any order, header names must match):
   ItemID | Name | Section | Price | ImageURL | InventoryCount |
   Sizes | SizeCounts | Description

   Sizes and SizeCounts are comma separated and line up by position,
   e.g. Sizes = "S,M,L,XL" and SizeCounts = "8,12,12,4" means 8 Small,
   12 Medium, 12 Large, 4 XL in stock. */

function loadInventory() {
  return new Promise(function (resolve, reject) {
    Papa.parse(INVENTORY_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const items = results.data
          .map(rowToItem)
          .filter(function (item) { return item.name && item.itemId; });
        resolve(items);
      },
      error: function (err) {
        reject(err);
      }
    });
  });
}

function rowToItem(row) {
  const sizeNames = splitList(row.Sizes);
  const sizeCounts = splitList(row.SizeCounts).map(Number);

  const sizes = sizeNames.map(function (name, i) {
    return { name: name, count: sizeCounts[i] !== undefined ? sizeCounts[i] : null };
  });

  return {
    itemId: (row.ItemID || "").trim(),
    name: (row.Name || "").trim(),
    section: (row.Section || "").trim(),
    price: parseFloat(row.Price) || 0,
    imageUrl: (row.ImageURL || "").trim(),
    inventoryCount: row.InventoryCount === "" ? null : Number(row.InventoryCount),
    sizes: sizes,
    description: (row.Description || "").trim()
  };
}

function splitList(value) {
  if (!value) return [];
  return String(value).split(",").map(function (v) { return v.trim(); }).filter(Boolean);
}

function itemsForSection(items, section) {
  if (section.id === "all") return items;
  return items.filter(function (item) {
    return item.section.toLowerCase() === section.label.toLowerCase();
  });
}
