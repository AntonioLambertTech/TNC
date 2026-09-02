# T-Shirt Shop Website

A simple, editable t-shirt shop. Sections on the homepage come from
`js/config.js`, product data comes from a Google Sheet, and orders are
paid through Stripe and logged to a second Google Sheet.

## What's in this folder

```
index.html            homepage
category.html          "see all" page for one section
order-success.html     page shown after a successful payment
css/style.css           all styling
js/config.js            EDIT THIS to add/remove sections and set links
js/data.js              reads the inventory Google Sheet
js/render.js             builds the product grids
js/cart.js               shopping cart
js/checkout.js           checkout form and Stripe hand-off
apps-script/Code.gs     backend code that goes inside the Google Sheet
images/                 put logo.png and placeholder.png here
```

## Step 1: Set up the Google Sheet

Create a new Google Sheet with two tabs.

**Inventory** tab, with these exact column headers in row 1:

| ItemID | Name | Section | Price | ImageURL | InventoryCount | Sizes | SizeCounts | Description |
|---|---|---|---|---|---|---|---|---|

- `Section` must match one of the `label` values in `js/config.js` exactly (not case sensitive), for example `Party` or `Graduation`.
- `Sizes` and `SizeCounts` are comma separated and line up in order, for example `S,M,L,XL` and `8,12,12,4`.
- `ImageURL` needs a direct link to a photo. The easiest way: upload the photo to a Google Drive folder, share it as "Anyone with the link", then use a link in this format so it loads as an actual image instead of a Drive page:
  `https://drive.google.com/uc?export=view&id=THE_FILE_ID`
  (the file ID is the long string in the Drive share link).

**Orders** tab, with these exact column headers in row 1:

| Timestamp | OrderID | CustomerName | Email | Phone | Address | Items | Total | Status | DesignImageURL | StripeSessionID |
|---|---|---|---|---|---|---|---|---|---|---|

Leave the rows under the headers empty. The Apps Script fills them in automatically.

## Step 2: Publish the Inventory tab so the website can read it

1. Open the Inventory tab.
2. File > Share > Publish to web.
3. Under "Link", choose the Inventory sheet and pick CSV as the format.
4. Click Publish and copy the link.
5. Paste that link into `INVENTORY_CSV_URL` in `js/config.js`.

Any time you edit the Inventory tab, the website picks up the change automatically, no re-publishing needed.

## Step 3: Add the backend code

1. In the Google Sheet, go to Extensions > Apps Script.
2. Delete the placeholder code and paste in everything from `apps-script/Code.gs`.
3. In the left sidebar, open Project Settings, and under Script Properties add:
   - `STRIPE_SECRET_KEY` your Stripe secret key (starts with `sk_test_` while testing)
   - `DESIGN_FOLDER_ID` the ID of a Google Drive folder to store uploaded design images (the long string in that folder's URL)
4. Click Deploy > New deployment.
5. Choose type "Web app".
6. Set "Execute as" to yourself, and "Who has access" to Anyone.
7. Deploy, and copy the web app URL.
8. Paste that URL into `APPS_SCRIPT_URL` in `js/config.js`.

## Step 4: Set up Stripe

1. Create a free Stripe account if you don't have one, and stay in test mode at first.
2. Get your secret key from the Stripe dashboard and put it in Script Properties as above.
3. In the Stripe dashboard, go to Developers > Webhooks and add an endpoint.
4. For the endpoint URL, use your Apps Script web app URL from Step 3, with `?action=webhook` added to the end.
5. Select the `checkout.session.completed` event.
6. Test a purchase with Stripe's test card number 4242 4242 4242 4242, any future expiry date, and any CVC. Check that a row appears in the Orders tab with Status "Paid".
7. When you're ready to take real payments, switch Stripe to live mode and replace the test secret key in Script Properties with your live secret key.

## Step 5: Add the logo and a placeholder photo

Put your logo in `images/logo.png` and a fallback product photo in
`images/placeholder.png`. If a product's `ImageURL` is ever blank, the
placeholder shows instead so the layout never breaks.

## Step 6: Put your company info in

Open `js/config.js` and fill in `COMPANY.name`, `COMPANY.phone`, and
`COMPANY.email`.

## Step 7: Add or remove homepage sections

Still in `js/config.js`, edit the `SECTIONS` list. Each line needs an
`id` (used in the "see all" link, keep it short with no spaces) and a
`label` (must match a value in the Sheet's Section column). Add a line
to add a section, delete a line to remove one. The order in the list
is the order sections appear on the page.

## Step 8: Put it on GitHub and go live with GitHub Pages

1. Create a new repository on GitHub and push this whole folder to it.
2. In the repository, go to Settings > Pages.
3. Under "Source", choose the `main` branch and the root folder.
4. Save. GitHub will give you a live URL in a minute or two, usually
   `https://yourusername.github.io/your-repo-name/`.
5. From then on, anyone with write access to the repository can edit
   `js/config.js` (or any other file) right in GitHub, and the live
   site updates automatically after the change is saved.

## Notes and things to keep an eye on

- This site keeps things intentionally simple. It does not check live
  inventory counts against the sizes people pick at checkout time, it
  just shows "sold out" next to a size once its count hits zero in the
  sheet. Update `InventoryCount` and `SizeCounts` by hand after orders
  come in, or extend `apps-script/Code.gs` to subtract counts
  automatically once you're comfortable editing it.
- Uploaded design images are stored in the Google Drive folder you set
  up in Step 3, with a link saved in the Orders sheet next to each
  order.
- Keep your Stripe secret key only in Script Properties, never in a
  file that goes to GitHub.
