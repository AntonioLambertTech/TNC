/* ======================================================================
   Paste this whole file into Extensions > Apps Script on your Google
   Sheet, then follow README.md to set the three script properties and
   deploy it as a web app. Do not put your Stripe key directly in this
   file, use Script Properties (Project Settings, in the left sidebar).
   ====================================================================== */

const ORDERS_SHEET_NAME = "Orders";

/* Every POST request (from the website, and from Stripe's webhook)
   comes through here. The website sends {action: "createCheckout"} in
   the body. Stripe's webhook is pointed at this URL with ?action=webhook
   added to the end. */
function doPost(e) {
  if (e.parameter.action === "webhook") {
    return handleStripeWebhook(e);
  }

  const body = JSON.parse(e.postData.contents);
  if (body.action === "createCheckout") {
    return createCheckoutSession(body);
  }
  return jsonResponse({ error: "Unknown action" });
}

function createCheckoutSession(body) {
  const props = PropertiesService.getScriptProperties();
  const stripeKey = props.getProperty("STRIPE_SECRET_KEY");
  const orderId = "ORD-" + new Date().getTime();

  let designUrl = "";
  if (body.designImageBase64) {
    designUrl = saveDesignImage(body.designImageBase64, orderId);
  }

  const payload = {
    mode: "payment",
    success_url: body.successUrl,
    cancel_url: body.cancelUrl,
    "metadata[orderId]": orderId
  };

  body.items.forEach(function (item, i) {
    payload["line_items[" + i + "][price_data][currency]"] = "usd";
    payload["line_items[" + i + "][price_data][product_data][name]"] = item.name + " (" + item.size + ")";
    payload["line_items[" + i + "][price_data][unit_amount]"] = Math.round(item.price * 100);
    payload["line_items[" + i + "][quantity]"] = item.qty;
  });

  const response = UrlFetchApp.fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "post",
    payload: payload,
    headers: { Authorization: "Bearer " + stripeKey },
    muteHttpExceptions: true
  });

  const session = JSON.parse(response.getContentText());

  if (!session.url) {
    return jsonResponse({ error: "Stripe error", details: session });
  }

  // Log the order right away as Pending. The webhook flips it to Paid
  // once Stripe confirms the payment actually went through.
  logOrder(orderId, body, "Pending", designUrl, session.id);

  return jsonResponse({ checkoutUrl: session.url, orderId: orderId });
}

function saveDesignImage(base64Data, orderId) {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty("DESIGN_FOLDER_ID");
  const folder = DriveApp.getFolderById(folderId);

  const matches = base64Data.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
  if (!matches) return "";

  const blob = Utilities.newBlob(Utilities.base64Decode(matches[2]), matches[1], orderId + "-design");
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function logOrder(orderId, body, status, designUrl, stripeSessionId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDERS_SHEET_NAME);
  const itemsSummary = body.items.map(function (i) {
    return i.name + " x" + i.qty + " (size " + i.size + ")";
  }).join("; ");
  const total = body.items.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);

  sheet.appendRow([
    new Date(),
    orderId,
    body.customer.name,
    body.customer.email,
    body.customer.phone,
    body.customer.address,
    itemsSummary,
    total.toFixed(2),
    status,
    designUrl,
    stripeSessionId
  ]);
}

/* Instead of verifying Stripe's signature header (which Apps Script
   does not expose reliably), this re-fetches the session directly from
   Stripe using our own secret key and only marks an order Paid if
   Stripe itself confirms payment_status is "paid". */
function handleStripeWebhook(e) {
  const event = JSON.parse(e.postData.contents);

  if (event.type === "checkout.session.completed") {
    const sessionId = event.data.object.id;
    const props = PropertiesService.getScriptProperties();
    const stripeKey = props.getProperty("STRIPE_SECRET_KEY");

    const verifyResponse = UrlFetchApp.fetch(
      "https://api.stripe.com/v1/checkout/sessions/" + sessionId,
      { headers: { Authorization: "Bearer " + stripeKey } }
    );
    const verified = JSON.parse(verifyResponse.getContentText());

    if (verified.payment_status === "paid" && verified.metadata && verified.metadata.orderId) {
      updateOrderStatus(verified.metadata.orderId, "Paid");
    }
  }

  return jsonResponse({ received: true });
}

function updateOrderStatus(orderId, status) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDERS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (data[r][1] === orderId) {
      sheet.getRange(r + 1, 9).setValue(status); // column 9 is Status
      break;
    }
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
